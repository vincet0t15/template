<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        // Get ALL users except current user with their latest chat activity
        $chatUsers = User::where('id', '!=', $userId)
            ->select('id', 'name', 'username', 'last_seen')
            ->withCount([
                'sentChats as unread_count' => function ($query) use ($userId) {
                    $query->where('receiver_id', $userId)
                        ->where('is_read', false);
                }
            ])
            ->with([
                'receivedChats' => function ($query) use ($userId) {
                    $query->where('sender_id', $userId)
                        ->orderBy('created_at', 'desc')
                        ->limit(1);
                },
                'sentChats' => function ($query) use ($userId) {
                    $query->where('receiver_id', $userId)
                        ->orderBy('created_at', 'desc')
                        ->limit(1);
                }
            ])
            ->get()
            ->map(function ($user) use ($userId) {
                // Get the latest message (either sent or received)
                $latestReceived = $user->receivedChats->first();
                $latestSent = $user->sentChats->first();

                $latestMessage = null;
                if ($latestReceived && $latestSent) {
                    $latestMessage = $latestReceived->created_at > $latestSent->created_at ? $latestReceived : $latestSent;
                } else {
                    $latestMessage = $latestReceived ?? $latestSent;
                }

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'unread_count' => $user->unread_count,
                    'is_online' => $user->last_seen && $user->last_seen->diffInMinutes(now()) < 5,
                    'last_message' => $latestMessage ? $latestMessage->message : null,
                    'last_message_time' => $latestMessage ? $latestMessage->created_at : null,
                    'total_messages' => $latestReceived || $latestSent ?
                        \App\Models\Chat::betweenUsers($user->id, $userId)->count() : 0,
                ];
            })
            // Sort: Users with latest messages first, then users without chats
            ->sortByDesc(function ($user) {
                return $user['last_message_time'] ? 1 : 0;
            })
            ->sortByDesc(function ($user) {
                return $user['last_message_time'] ? strtotime($user['last_message_time']) : 0;
            })
            ->values();

        return Inertia::render('chat/index', [
            'chatUsers' => $chatUsers,
            'selectedUserId' => $request->query('user'),
        ]);
    }

    public function conversations(Request $request, $userId)
    {
        $currentUserId = Auth::id();
        $beforeId = $request->query('before');
        $limit = 10; // Load 10 messages at a time for better performance

        $query = Chat::betweenUsers($currentUserId, $userId)
            ->with(['sender:id,username', 'receiver:id,username'])
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        // If before ID is provided, load older messages
        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        $messages = $query->get()->reverse()->values(); // Reverse to get ascending order

        // Mark messages as read (only on first load, not when loading older messages)
        if (!$beforeId) {
            Chat::where('sender_id', $userId)
                ->where('receiver_id', $currentUserId)
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        }

        return response()->json([
            'messages' => $messages,
            'has_more' => $messages->count() === $limit,
        ]);
    }

    public function send(Request $request, $userId)
    {
        $request->validate([
            'message' => 'nullable|string|max:1000',
            'file' => 'nullable|file|max:25600', // Max 25MB (25600 KB)
        ]);

        $filePath = null;
        $fileName = null;
        $fileType = null;

        try {
            // Handle file upload if present
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = $file->getClientOriginalName();
                $fileType = $file->getMimeType();
                $filePath = $file->store('chat-attachments', 'public');
            }

            $chat = Chat::create([
                'sender_id' => Auth::id(),
                'receiver_id' => $userId,
                'message' => $request->message,
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_type' => $fileType,
                'is_read' => false,
            ]);

            // Broadcast the message
            Log::info('Broadcasting MessageSent event', [
                'chat_id' => $chat->id,
                'sender_id' => $chat->sender_id,
                'receiver_id' => $chat->receiver_id,
            ]);

            event(new MessageSent($chat->load(['sender:id,username', 'receiver:id,username'])));

            Log::info('MessageSent event dispatched successfully');

            return response()->json([
                'success' => true,
                'chat' => $chat->load(['sender:id,username', 'receiver:id,username']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message',
            ], 500);
        }
    }

    public function unreadCount()
    {
        $count = Chat::where('receiver_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function downloadFile($filePath)
    {
        // Decode the file path (URL encoding)
        $filePath = urldecode($filePath);

        $path = storage_path('app/public/' . $filePath);

        if (!file_exists($path)) {
            abort(404, 'File not found');
        }

        // Get file info
        $fileName = basename($path);
        $mimeType = mime_content_type($path);

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ]);
    }

    public function deleteMessage($messageId)
    {
        $userId = Auth::id();

        $message = Chat::where('id', $messageId)
            ->where('sender_id', $userId)
            ->first();

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Message not found or you do not have permission to delete it',
            ], 403);
        }

        // Delete associated file if exists
        if ($message->file_path) {
            $filePath = storage_path('app/public/' . $message->file_path);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }

        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Message deleted successfully',
        ]);
    }
}

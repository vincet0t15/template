<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chat;
    public $senderId;
    public $receiverId;

    /**
     * Create a new event instance.
     */
    public function __construct(Chat $chat)
    {
        $this->chat = $chat->load(['sender:id,username', 'receiver:id,username']);
        $this->senderId = $chat->sender_id;
        $this->receiverId = $chat->receiver_id;

        Log::info('MessageSent event created', [
            'chat_id' => $chat->id,
            'sender_id' => $this->senderId,
            'receiver_id' => $this->receiverId,
        ]);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('chat.' . $this->receiverId),
            new PrivateChannel('chat.' . $this->senderId),
        ];

        Log::info('Broadcasting to channels', [
            'channels' => [
                'chat.' . $this->receiverId,
                'chat.' . $this->senderId,
            ]
        ]);

        return $channels;
    }

    public function broadcastWith(): array
    {
        Log::info('MessageSent broadcastWith called', [
            'chat_id' => $this->chat->id,
            'sender_id' => $this->chat->sender_id,
            'receiver_id' => $this->chat->receiver_id,
        ]);

        return [
            'id' => $this->chat->id,
            'sender_id' => $this->chat->sender_id,
            'receiver_id' => $this->chat->receiver_id,
            'message' => $this->chat->message,
            'is_read' => $this->chat->is_read,
            'created_at' => $this->chat->created_at->toIso8601String(),
            'sender' => [
                'id' => $this->chat->sender->id,
                'username' => $this->chat->sender->username,
            ],
            'receiver' => [
                'id' => $this->chat->receiver->id,
                'username' => $this->chat->receiver->username,
            ],
        ];
    }
}

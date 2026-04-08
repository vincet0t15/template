interface Echo {
    private(channel: string): any;
    channel(channel: string): any;
}

interface Window {
    Echo?: Echo;
    Pusher?: any;
}

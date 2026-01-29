-- Enable Realtime for notifications table
-- This allows the client to subscribe to changes on this table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

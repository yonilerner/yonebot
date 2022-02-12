module default {
    type StarboardMessage {
        required property starredMessageId -> str {
            constraint exclusive;
        }
        required property starboardMessageId -> str {
            constraint exclusive;
        }
        required property insertTimestamp -> datetime {
            default := datetime_current();
        }
    }
}

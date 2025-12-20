import React from "react";
import Icon from "../../../../components/AppIcon";

const KitchenNotes = ({ notes, currentTime }) => {
  const getTimeAgo = (timestamp) => {
    const diff = Math.floor((currentTime - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  const getNoteIcon = (type) => {
    switch (type) {
      case "info":
        return "Info";
      case "warning":
        return "AlertTriangle";
      case "success":
        return "CheckCircle";
      default:
        return "MessageSquare";
    }
  };

  const getNoteColor = (type) => {
    switch (type) {
      case "info":
        return "text-accent";
      case "warning":
        return "text-warning";
      case "success":
        return "text-success";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-warm">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="MessageSquare" size={20} color="var(--color-primary)" />
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Kitchen Updates
        </h3>
      </div>

      {notes && notes?.length > 0 ? (
        <div className="space-y-3">
          {notes?.map((note) => (
            <div
              key={note?.id}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-md"
            >
              <Icon
                name={getNoteIcon(note?.type)}
                size={16}
                className={`flex-shrink-0 mt-0.5 ${getNoteColor(note?.type)}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground mb-1">{note?.message}</p>
                <p className="text-xs text-muted-foreground">
                  {getTimeAgo(note?.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <Icon
            name="MessageSquare"
            size={32}
            color="var(--color-muted-foreground)"
            className="mx-auto mb-2"
          />
          <p className="text-sm text-muted-foreground">No updates yet</p>
        </div>
      )}
    </div>
  );
};

export default KitchenNotes;

import React from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../../components/AppIcon";

const RecentActivityFeed = ({ activities }) => {
  const { t } = useTranslation();
  const getActivityStyles = (type) => {
    // Returns { bg, border, icon, text } classes
    switch (type) {
      case "order_completed":
        return {
          bg: "bg-success/10",
          border: "border-success/20",
          icon: "text-success",
          badge: "bg-success/10 text-success border-success/20",
          iconName: "CheckCircle2",
        };
      case "order_served":
        return {
          bg: "bg-success/10",
          border: "border-success/20",
          icon: "text-success",
          badge: "bg-success/10 text-success border-success/20",
          iconName: "Check",
        };
      case "order_ready":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: "text-amber-500",
          badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          iconName: "ChefHat",
        };
      case "order_preparing":
        return {
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
          icon: "text-orange-500",
          badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
          iconName: "Flame",
        };
      case "order_accepted":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          icon: "text-blue-500",
          badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          iconName: "UserCheck",
        };
      case "order_submitted":
        return {
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
          icon: "text-purple-500",
          badge: "bg-purple-500/10 text-purple-500 border-purple-500/20",
          iconName: "Send",
        };
      case "payment_received":
        return {
          bg: "bg-primary/10",
          border: "border-primary/20",
          icon: "text-primary",
          badge: "bg-primary/10 text-primary border-primary/20",
          iconName: "DollarSign",
        };
      case "table_assigned":
        return {
          bg: "bg-accent/10",
          border: "border-accent/20",
          icon: "text-accent",
          badge: "bg-accent/10 text-accent border-accent/20",
          iconName: "Users",
        };
      case "system_alert":
        return {
          bg: "bg-destructive/10",
          border: "border-destructive/20",
          icon: "text-destructive",
          badge: "bg-destructive/10 text-destructive border-destructive/20",
          iconName: "AlertTriangle",
        };
      default:
        return {
          bg: "bg-muted",
          border: "border-border",
          icon: "text-muted-foreground",
          badge: "bg-muted text-muted-foreground border-border",
          iconName: "Bell",
        };
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return t('admin.dashboard.time.justNow');
    if (diffMins < 60) return t('admin.dashboard.time.minutesAgo', { count: diffMins });
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return t('admin.dashboard.time.hoursAgo', { count: diffHours });
    return activityTime.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6 shadow-warm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground">
            {t('admin.dashboard.sections.recentActivity')}
          </h3>
          <p className="text-sm text-muted-foreground">{t('admin.dashboard.sections.recentActivityDesc')}</p>
        </div>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors font-medium hover:underline underline-offset-4">
          {t('common.actions.viewAll')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[500px]">
        {(!activities || activities.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Icon name="Activity" size={24} className="opacity-50" />
            </div>
            <p className="text-sm">{t('admin.dashboard.activity.noActivity')}</p>
          </div>
        ) : (
          <div className="relative text-sm"> {/* Spacing handled by padding inside items */}
            {activities.map((activity, index) => {
              const styles = getActivityStyles(activity.type);
              const isLast = index === activities.length - 1;

              return (
                <div
                  key={activity.id || index}
                  className="relative flex gap-4 p-4 rounded-lg hover:bg-muted/40 transition-colors transition-transform duration-200 border-b 
                  border-border/40 last:border-0 cursor-pointer group hover:scale-[1.03]"
                >
                  {/* Timeline Line - adjusted for padding */}
                  {!isLast && (
                    <div className="absolute left-[34px] top-12 bottom-0 w-0.5 bg-border/40 group-hover:bg-border transition-colors -ml-px z-0" />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-card shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${styles.border}`}
                  >
                    <div className={`h-full w-full rounded-full flex items-center justify-center ${styles.bg}`}>
                      <Icon name={styles.iconName} size={16} className={styles.icon} />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 flex flex-col pt-0.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading font-medium text-foreground pr-4 leading-tight group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap tabular-nums">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>

                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed line-clamp-2">
                      {activity.description}
                    </p>

                    {activity.amount && (
                      <div className="mt-2.5 flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${styles.badge}`}>
                          {activity.type === 'payment_received' ? '+' : ''}${Math.round(parseFloat(activity.amount))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityFeed;

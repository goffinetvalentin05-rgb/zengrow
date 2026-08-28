"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { useLocale } from "../locale-provider";

export function TodayMockup() {
  const { t } = useLocale();
  const { title, actions } = t.todayMockup;

  return (
    <div className="go-mock">
      <div className="go-mock__head">
        <span className="go-mock__head-title">
          <Sparkles strokeWidth={1.75} aria-hidden />
          {title}
        </span>
      </div>

      <div className="go-mock__list">
        {actions.map((action) => (
          <div key={action.index} className="go-mock__row">
            <span className="go-mock__index">{action.index}</span>
            <div>
              <p className="go-mock__title">{action.title}</p>
              <p className="go-mock__desc">{action.description}</p>
            </div>
            <span className="go-mock__pill">{action.impact}</span>
            <ChevronRight className="go-mock__chevron" strokeWidth={1.75} aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}

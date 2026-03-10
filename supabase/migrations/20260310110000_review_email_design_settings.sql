alter table public.review_automation_settings
  add column if not exists email_subject text not null default 'How was your experience at {{restaurant_name}}?',
  add column if not exists email_message text not null default 'Thank you for visiting {{restaurant_name}}.
We would love to hear about your experience.',
  add column if not exists button_positive_label text not null default 'Excellent',
  add column if not exists button_neutral_label text not null default 'Average',
  add column if not exists button_negative_label text not null default 'Not great',
  add column if not exists primary_color text not null default '#1F7A6C';

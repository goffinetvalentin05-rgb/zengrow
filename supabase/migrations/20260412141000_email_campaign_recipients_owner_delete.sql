drop policy if exists "email_campaign_recipients_owner_delete" on public.email_campaign_recipients;

create policy "email_campaign_recipients_owner_delete"
on public.email_campaign_recipients for delete
using (
  exists (
    select 1
    from public.email_campaigns ec
    join public.restaurants r on r.id = ec.restaurant_id
    where ec.id = email_campaign_recipients.campaign_id
      and r.owner_id = auth.uid()
  )
);

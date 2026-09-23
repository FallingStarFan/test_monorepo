INSERT INTO notification.app_notification (
    id,
    user_id,
    type,
    title,
    body,
    link_path,
    actor_user_id,
    actor_label,
    created_at
)
SELECT
    gen_random_uuid(),
    u.id,
    'system',
    'Welcome',
    'Welcome to the system.',
    '/',
    NULL,
    NULL,
    NOW()
FROM auth.users u
WHERE u.email = 'admin@example.com'
  AND NOT EXISTS (
      SELECT 1
      FROM notification.app_notification n
      WHERE n.user_id = u.id
        AND n.type = 'system'
        AND n.title = 'Welcome'
  );
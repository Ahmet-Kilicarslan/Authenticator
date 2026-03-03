Begin;

insert into roles (name)
values ('admin'),
       ('user');

insert into permissions (name)
values ('profile:edit_own'),
       ('profile:view_own'),
       ('profile:view_any'),
       ('user:list'),
       ('user:delete');

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
         join permissions p on p.name IN ('profile:edit_own', 'profile:view_own')
where r.name = 'user';

insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r
         join permissions p on p.name IN ('profile:edit_own',
                                          'profile:view_own',
                                          'profile:view_any',
                                         'user:list',
                                         'user:delete')
where r.name = 'admin';
commit;
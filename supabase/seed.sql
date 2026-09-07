-- Valgfritt startinnhold: hyttene dere har booket.
insert into accommodation (name, capacity)
values ('Hytte A', 8),
       ('Hytte B', 8),
       ('Hytte C', 9)
on conflict (name) do nothing;

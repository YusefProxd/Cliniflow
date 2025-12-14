
create extension if not exists "uuid-ossp";

create table if not exists public.pagos (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references public.usuarios(id) on delete cascade not null,
  servicio_id uuid references public.servicios(id) on delete set null,
  moneda text not null default 'PEN',
  monto numeric(10,2) not null check (monto >= 0),
  metodo text not null default 'yape',
  estado text not null check (estado in ('pending_verification', 'approved', 'rejected'))
    default 'pending_verification',
  codigo_operacion text not null,
  voucher_url text not null,
  fecha_cita date,
  hora_cita time,
  motivo text,
  creado_en timestamptz not null default now()
);

alter table public.pagos enable row level security;

drop policy if exists "usuario ve sus pagos" on public.pagos;
create policy "usuario ve sus pagos"
on public.pagos
for select
using (auth.uid() = usuario_id);

drop policy if exists "usuario crea sus pagos" on public.pagos;
create policy "usuario crea sus pagos"
on public.pagos
for insert
with check (auth.uid() = usuario_id);

drop policy if exists "usuario actualiza pago pendiente" on public.pagos;
create policy "usuario actualiza pago pendiente"
on public.pagos
for update
using (auth.uid() = usuario_id and estado = 'pending_verification')
with check (auth.uid() = usuario_id and estado = 'pending_verification');

drop policy if exists "admin ve todos los pagos" on public.pagos;
create policy "admin ve todos los pagos"
on public.pagos
for select
using ((auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');

drop policy if exists "admin actualiza pagos" on public.pagos;
create policy "admin actualiza pagos"
on public.pagos
for update
using ((auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin')
with check ((auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');

alter table public.usuarios enable row level security;

drop policy if exists "admin puede ver usuarios" on public.usuarios;
create policy "admin puede ver usuarios"
on public.usuarios
for select
using ((auth.jwt() -> 'user_metadata' ->> 'rol') = 'admin');


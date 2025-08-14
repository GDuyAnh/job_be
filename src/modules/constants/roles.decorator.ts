import { SetMetadata } from '@nestjs/common';
import { RoleStatus } from '@/enum/role';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleStatus[]) => SetMetadata(ROLES_KEY, roles);

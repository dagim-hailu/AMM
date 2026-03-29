export interface Permission {
  [key: string]: string[]; // e.g., "appointments": ["read", "write", "delete"]
}

export interface RoleProps {
  id: string;
  name: string;
  description?: string;
  permissions: Permission;
  isSystem: boolean;
  createdAt: Date;
}

export class Role {
  constructor(private readonly props: RoleProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get permissions(): Permission {
    return this.props.permissions;
  }

  get isSystem(): boolean {
    return this.props.isSystem;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  updatePermissions(permissions: Permission): void {
    this.props.permissions = permissions;
  }

  updateDescription(description: string): void {
    this.props.description = description;
  }

  hasPermission(application: string, action: string): boolean {
    const appPermissions = this.permissions[application];
    if (!appPermissions) return false;
    
    return appPermissions.includes(action) || appPermissions.includes('*');
  }

  static create(props: {
    name: string;
    description?: string;
    permissions?: Permission;
    isSystem?: boolean;
  }): Role {
    const now = new Date();
    return new Role({
      id: crypto.randomUUID(),
      name: props.name,
      description: props.description,
      permissions: props.permissions || {},
      isSystem: props.isSystem || false,
      createdAt: now,
    });
  }

  static reconstruct(props: RoleProps): Role {
    return new Role(props);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      permissions: this.permissions,
      isSystem: this.isSystem,
      createdAt: this.createdAt,
    };
  }
}
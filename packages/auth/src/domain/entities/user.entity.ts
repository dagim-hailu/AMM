export interface UserProps {
  id: string;
  email: string;
  hashedPassword: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  constructor(private readonly props: UserProps) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get hashedPassword(): string {
    return this.props.hashedPassword;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get role(): string {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  updateLastLogin(): void {
    this.props.lastLoginAt = new Date();
    this.props.updatedAt = new Date();
  }

  updateProfile(fullName: string, role?: string): void {
    this.props.fullName = fullName;
    if (role) {
      this.props.role = role;
    }
    this.props.updatedAt = new Date();
  }

  changePassword(newHashedPassword: string): void {
    this.props.hashedPassword = newHashedPassword;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  static create(props: {
    email: string;
    hashedPassword: string;
    fullName: string;
    role?: string;
  }): User {
    const now = new Date();
    return new User({
      id: crypto.randomUUID(),
      email: props.email,
      hashedPassword: props.hashedPassword,
      fullName: props.fullName,
      role: props.role || 'staff',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: UserProps): User {
    return new User(props);
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
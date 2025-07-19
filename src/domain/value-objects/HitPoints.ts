export class HitPoints {
  constructor(
    private readonly maxHp: number,
    private currentHp: number
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.maxHp <= 0) {
      throw new Error('Maximum hit points must be greater than 0');
    }
    if (this.currentHp < 0) {
      throw new Error('Current hit points cannot be negative');
    }
    if (this.currentHp > this.maxHp) {
      this.currentHp = this.maxHp;
    }
  }

  getMaxHp(): number {
    return this.maxHp;
  }

  getCurrentHp(): number {
    return this.currentHp;
  }

  isAlive(): boolean {
    return this.currentHp > 0;
  }

  isAtFullHealth(): boolean {
    return this.currentHp === this.maxHp;
  }

  takeDamage(damage: number): HitPoints {
    if (damage < 0) {
      throw new Error('Damage cannot be negative');
    }
    const newCurrentHp = Math.max(0, this.currentHp - damage);
    return new HitPoints(this.maxHp, newCurrentHp);
  }

  heal(healAmount: number): HitPoints {
    if (healAmount < 0) {
      throw new Error('Heal amount cannot be negative');
    }
    const newCurrentHp = Math.min(this.maxHp, this.currentHp + healAmount);
    return new HitPoints(this.maxHp, newCurrentHp);
  }

  equals(other: HitPoints): boolean {
    return this.maxHp === other.maxHp && this.currentHp === other.currentHp;
  }
}
import { Injectable } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

@Injectable({ providedIn: 'root' })
export class DefaultHammerConfig extends HammerGestureConfig {
  override overrides = {
    swipe: { direction: Hammer.DIRECTION_ALL, touchAction: 'auto' },
  };
}

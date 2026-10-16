<?php

use Illuminate\Support\Facades\Schedule;

// Rappels d'expiration (J-30, J-7, J-1), période de grâce et expiration des abonnements.
Schedule::command('subscriptions:process')->dailyAt('06:00')->withoutOverlapping();

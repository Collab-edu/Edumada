<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerSearchMacros();

        // Hors production : erreur sur le chargement paresseux (N+1) et les attributs non autorisés.
        Model::shouldBeStrict(! $this->app->isProduction());

        Password::defaults(fn () => Password::min(8)->letters()->numbers());

        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)->by(
            Str::transliterate(Str::lower($request->string('email')).'|'.$request->ip()),
        ));

        RateLimiter::for('track', fn (Request $request) => Limit::perMinute(120)->by($request->ip()));
        RateLimiter::for('reports', fn (Request $request) => Limit::perHour(10)->by($request->ip()));
        RateLimiter::for('contact', fn (Request $request) => Limit::perHour(5)->by($request->ip()));

        Gate::define('admin', fn (User $user) => $user->isAdmin());

        RateLimiter::for('register', fn (Request $request) => Limit::perHour(10)->by($request->ip()));
        // Suggestions de lieux à la frappe : jusqu'à 2 par seconde et par visiteur.
        RateLimiter::for('places', fn (Request $request) => Limit::perMinute(120)->by($request->ip()));
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perHour(10)->by($request->ip()));
    }

    /**
     * « Contient ce texte », sans tenir compte de la casse ni des accents : « ecole » trouve
     * « École » sous MySQL / MariaDB (collation), PostgreSQL (extension unaccent) et SQLite (casse).
     */
    private function registerSearchMacros(): void
    {
        $contains = function (Builder $query, string $column, string $text, string $boolean): Builder {
            if ($query->getConnection()->getDriverName() === 'pgsql') {
                return $query->whereRaw('unaccent('.$query->getGrammar()->wrap($column).'::text) ilike unaccent(?)', ["%{$text}%"], $boolean);
            }

            return $query->whereLike($column, "%{$text}%", false, $boolean);
        };

        Builder::macro('whereContains', fn (string $column, string $text) => $contains($this, $column, $text, 'and'));
        Builder::macro('orWhereContains', fn (string $column, string $text) => $contains($this, $column, $text, 'or'));
    }
}

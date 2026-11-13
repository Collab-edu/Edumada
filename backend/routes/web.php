<?php

use Illuminate\Routing\Route as RoutingRoute;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::get('/', function () {
    // En ligne, la liste des routes (admin comprises) ne doit pas être publique.
    if (! app()->isLocal()) {
        return view('welcome');
    }

    $groups = collect(Route::getRoutes()->getRoutes())
        ->filter(fn (RoutingRoute $route) => Str::startsWith($route->uri(), 'api/'))
        ->map(function (RoutingRoute $route) {
            $middleware = $route->gatherMiddleware();
            $path = Str::after($route->uri(), 'api/');
            $segments = explode('/', $path);
            // « v1/admin/establishments » → groupe « admin » ; « v1/offers » → « offers ».
            $group = preg_match('/^v\d+$/', $segments[0]) ? ($segments[1] ?? $segments[0]) : $segments[0];

            return [
                'group' => $group,
                'methods' => array_values(array_diff($route->methods(), ['HEAD'])),
                'uri' => '/'.$route->uri(),
                'name' => $route->getName(),
                'auth' => collect($middleware)->contains(fn ($m) => is_string($m) && Str::startsWith($m, 'auth')),
                'action' => Str::of($route->getActionName())->afterLast('\\')->replace('@', ' → ')->toString(),
            ];
        })
        ->sortBy('uri')
        ->groupBy('group')
        ->sortKeys();

    return view('api-index', ['groups' => $groups, 'total' => $groups->flatten(1)->count()]);
});

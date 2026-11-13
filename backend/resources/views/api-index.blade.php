<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API Edumada</title>
    <style>
        :root { --primary: #FF3B52; --secondary: #0F4C5C; --ink: #334155; --bg: #F6F8FA; --line: #E3E9EB; }
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 Inter, system-ui, sans-serif; }
        header { background: var(--secondary); color: #fff; padding: 24px 16px; }
        header div, main { max-width: 1024px; margin: 0 auto; }
        h1 { margin: 0; font-size: 24px; }
        header p { margin: 4px 0 0; color: #D5E4E8; }
        main { padding: 24px 16px 48px; }
        input { width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: 8px; font: inherit; margin-bottom: 24px; }
        section { margin-bottom: 28px; }
        h2 { margin: 0 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: var(--primary); }
        ul { list-style: none; margin: 0; padding: 0; background: #fff; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; }
        li { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; padding: 10px 14px; border-top: 1px solid var(--line); }
        li:first-child { border-top: 0; }
        .methods { display: flex; gap: 4px; min-width: 72px; }
        .m { font: 700 11px/1 ui-monospace, monospace; padding: 4px 6px; border-radius: 4px; color: #fff; }
        .GET { background: #2F855A; } .POST { background: #2B6CB0; } .PUT, .PATCH { background: #B7791F; } .DELETE { background: #C53030; }
        code { font: 600 14px ui-monospace, monospace; color: var(--secondary); word-break: break-all; }
        .auth { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: #FFE5E8; color: #C9223A; }
        .action { margin-left: auto; font-size: 13px; color: #64748B; }
    </style>
</head>
<body>
<header>
    <div>
        <h1>API Edumada</h1>
        <p>{{ $total }} routes · {{ url('/api/v1') }} · liste visible en local uniquement</p>
    </div>
</header>
<main>
    <input type="search" id="filter" placeholder="Filtrer (ex. offers, admin, POST…)" aria-label="Filtrer les routes">
    @foreach ($groups as $group => $routes)
        <section>
            <h2>{{ $group }} · {{ count($routes) }}</h2>
            <ul>
                @foreach ($routes as $route)
                    <li data-search="{{ strtolower(implode(' ', $route['methods']).' '.$route['uri'].' '.$route['name'].' '.$route['action']) }}">
                        <span class="methods">
                            @foreach ($route['methods'] as $method)
                                <span class="m {{ $method }}">{{ $method }}</span>
                            @endforeach
                        </span>
                        @if (in_array('GET', $route['methods']) && ! str_contains($route['uri'], '{') && ! $route['auth'])
                            <a href="{{ $route['uri'] }}"><code>{{ $route['uri'] }}</code></a>
                        @else
                            <code>{{ $route['uri'] }}</code>
                        @endif
                        @if ($route['auth'])
                            <span class="auth">connexion requise</span>
                        @endif
                        <span class="action">{{ $route['action'] }}</span>
                    </li>
                @endforeach
            </ul>
        </section>
    @endforeach
</main>
<script>
    document.getElementById('filter').addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll('li[data-search]').forEach((li) => { li.hidden = q && !li.dataset.search.includes(q); });
        document.querySelectorAll('section').forEach((s) => { s.hidden = !s.querySelector('li:not([hidden])'); });
    });
</script>
</body>
</html>

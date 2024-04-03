<script>
	import { page } from '$app/stores';
  import { base } from '$app/paths';
  let burgerState = false;
</script>

<style>
  nav {
    border-bottom: 1px solid rgba(255,62,0,0.1);
    font-weight: 300;
    padding: 0 1em;
  }

  [aria-current] {
    position: relative;
    display: inline-block;
  }

  [aria-current]::after {
    position: absolute;
    content: '';
    width: calc(100% - 1em);
    height: 2px;
    background-color: rgb(255,62,0);
    display: block;
    bottom: -1px;
  }

  a {
    text-decoration: none;
    padding: 1em 0.5em;
  }
</style>

<nav class="navbar" aria-label="main navigation">
  <div class="navbar-brand">
    <a 
      class="navbar-item" 
      class:is-active={$page.url.pathname === "/"}
      aria-current='{$page.url.pathname === "/" ? "page" : undefined}' 
      href='{base}/'> Now playing </a>
    <a 
      class="navbar-item" 
      class:is-active={$page.url.pathname === "/search"}
      aria-current='{$page.url.pathname === "/search" ? "page" : undefined}'
      href='{base}/search'>Search</a>
    <a 
      class="navbar-item" 
      class:is-active={$page.url.pathname === "/browse"}
      aria-current='{$page.url.pathname === "/browse" ? "page" : undefined}'
      href='{base}/browse'>Browse</a>
    <a 
      class="navbar-item" 
      class:is-active={$page.url.pathname === "/playlists"}
      aria-current='{$page.url.pathname === "/playlists" ? "page" : undefined}'
      href='{base}/playlists'>Playlists</a>

    <a role="button"
       class:is-active={burgerState}
       on:click={() => burgerState = !burgerState}
       class="navbar-burger burger"
       aria-label="menu" aria-expanded="false" href="{null}"
       data-target="navMenu">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>

  <div id="navMenu" class="navbar-menu" class:is-active={burgerState}>
    <div class="navbar-start">
      <a 
        class="navbar-item" 
        class:is-active={$page.url.pathname === "/settings"}
        aria-current='{$page.url.pathname === "/settings" ? "page" : undefined}' 
        href='{base}/settings'>Settings</a>
    </div>
    <a class="navbar-item  is-hidden-touch" href="https://github.com/cristianpb/muse">
      <figure class="image is-1by1">
        <img src="{base}/icon.svg" alt="Muse logo" width="20" height="20">
      </figure>
    </a>
    <a class="navbar-item is-hidden-desktop" href="https://github.com/cristianpb/muse">
      <img src="{base}/icon.svg" alt="Muse logo" width="18" height="18">
      Muse - __VERSION__
    </a>

  </div>
</nav>

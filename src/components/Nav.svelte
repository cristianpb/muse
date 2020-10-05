<script lang="ts">
  export let segment;
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

<nav class="navbar" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a 
      class="navbar-item" 
      class:is-active={segment === undefined}
      aria-current='{segment === undefined ? "page" : undefined}' 
      href='.'> Now playing </a>
    <a 
      class="navbar-item" 
      class:is-active={segment === "search"}
      aria-current='{segment === "search" ? "page" : undefined}'
      href='search'>Search</a>
    <a 
      class="navbar-item" 
      class:is-active={segment === "browse"}
      aria-current='{segment === "browse" ? "page" : undefined}'
      href='browse'>Browse</a>
    <a 
      class="navbar-item" 
      class:is-active={segment === "playlists"}
      aria-current='{segment === "playlists" ? "page" : undefined}'
      href='playlists'>Playlists</a>

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
        class:is-active={segment === "settings"}
        aria-current='{segment === "settings" ? "page" : undefined}' 
        href='settings'>Settings</a>
    </div>
    <a class="navbar-item  is-hidden-touch" href="https://github.com/cristianpb/muse">
      <figure class="image is-1by1">
        <img src="{process.env.NODE_ENV === 'development' ? '' : '/muse'}/icon.svg" alt="Muse logo" width="20" height="20">
      </figure>
    </a>
    <a class="navbar-item is-hidden-desktop" href="https://github.com/cristianpb/muse">
      <img src="{process.env.NODE_ENV === 'development' ? '' : '/muse'}/icon.svg" alt="Muse logo" width="18" height="18">
      Muse - __VERSION__
    </a>

  </div>
</nav>

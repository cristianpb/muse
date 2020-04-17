<nav class="navbar is-fixed-bottom " role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a href="{null}" class="navbar-item is-hidden-touch">
     Pr
    </a>
    <a href="{null}" class="navbar-item">
      Play
    </a>
    <a href="{null}" class="navbar-item is-hidden-touch">
      Next
    </a>
    <a href="{null}" class="navbar-item">
      {$currentTrack.name ? $currentTrack.name : "-:-"}
    </a>
    <a href="{null}" 
       class:is-active={burgerState}
       on:click={toggleBurger}
       role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navMenu">
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </a>
  </div>
  <div id="navMenu" class="navbar-menu" class:is-active={burgerState}>
    <div class="navbar-end">
      <div class="navbar-item  is-hidden-touch" on:click='{toggleClienstVisibility}'>
        {$snapClientsVisibility ? 'Hide' : 'Show' }
      </div>
      {#each $clients as client}
      <div class="navbar-item  is-hidden-desktop">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            {client.name}
          </div>
          <div class="column is-narrow">
            {client.muted ? 'Mut' : 'Ply' }
          </div>
          <div class="column">
            <progress class="progress" value="{client.volume}" max="100">{client.volume}%</progress>
          </div>
        </div>
      </div>
      {/each}
      <div class="navbar-item">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            SoundIcon
          </div>
          <div class="column">
            <progress class="progress" value="40" max="100">40%</progress>
          </div>
          <div class="column is-narrow">
            Mute
          </div>
          <div class="column is-narrow">
            Random
          </div>
        </div>
      </div>
      <div class="navbar-item">
        <div class="columns is-mobile">
          <div class="column is-narrow">
            1:12
          </div>
          <div class="column">
            <progress class="progress" value="15" max="100">15%</progress>
          </div>
          <div class="column is-narrow">
            3:14
          </div>
        </div>
      </div>
    </div>
  </div>
</nav>

<svelte:head>
  <style src="../scss/global.scss"></style>
</svelte:head>

<script>
  import { currentTrack } from '../tools/stores';
  import { clients, snapClientsVisibility } from '../tools/stores';

  let burgerState = false;

  function toggleBurger() {
    burgerState = !burgerState
  }

  function toggleClienstVisibility() {
    $snapClientsVisibility = !$snapClientsVisibility
  }
</script>

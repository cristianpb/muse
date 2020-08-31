<h1 class="title">Settings</h1>

<br>
<h2 class="subtitle">Snapcast server</h2>

<div class="columns is-multiline">
  <div class="column is-12-mobile is-4-desktop">
    <div class="field">
      <label class="label">Hostname</label>
      <div class="control">
        <input class="input is-rounded"
               type="text" 
               bind:value="{$snapcastHost}" 
               placeholder="Hostname">
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-4-desktop">
    <div class="field">
      <label class="label">Port</label>
      <div class="control">
        <input class="input is-rounded"
               type="text" 
               bind:value="{$snapcastPort}" 
               placeholder="Port">
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-4-desktop">
    <label class="label">SSL</label>
    <div class="control">
      <div class="select">
        <select bind:value={$snapcastSSL}>
          <option value="">http</option>
          <option value="1">https</option>
        </select>
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-6-desktop">
    <div class="field is-grouped is-grouped-multiline">
      <p class="control">
        <a class="button" href="{null}" on:click={() => promise = connectSnapcast()}>Connect</a>
      </p>
      <p class="control">
    {#if promise}
      {#await promise}
        <button class="button">
          <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
        </button>
      {:then _}
        <button class="button is-success" disabled>
          Connected
        </button>
      {:catch error}
        <button class="button is-danger" disabled>
          {error.message}
        </button>
      {/await}
    {/if}
      </p>
    </div>
  </div>
</div>


{#each $snapGroups as group, g}
  <div class="list is-hoverable basket">
    <div class="list-item"
         on:drop|preventDefault={event => drop(event, g)}
         ondragover="return false"
         on:dragenter="{() => hovering = group.name}"
         on:dragleave="{() => hovering = null}"
         class:hovering="{hovering === group.name}"
         >
         <div class="columns is-mobile">
           <div class="column">
             {#if editLine === g}
               <input class="input"
                      type="text" 
                      bind:value="{group.name}" 
                      on:input={() => editGroupName(group.id, group.name)}
                      placeholder="Group name">
             {:else}
               <b>Group {group.name ? `${group.name} - ` : ''}{group.id}</b>
             {/if}
           </div>
           {#if editLine === g}
             <div class="column is-narrow" on:click={() => editLine = null}>
               <FontAwesomeIcon icon={faCheckCircle} class="icon"/>
             </div>
           {:else}
             <div class="column is-narrow" on:click={() => editLine = g}>
               <FontAwesomeIcon icon={faEdit} class="icon"/>
             </div>
           {/if}
         </div>
    </div>
    {#each group.clients as client, i}
      <div 
        class="list-item" draggable={true} 
        on:dragstart={event => dragstart(event, g, i)}
        on:mouseenter={() => hoveringList = {group: g, client: i}}
        on:mouseleave={() => hoveringList = {}}
        class:is-active={hoveringList.group === g && hoveringList.client === i}
        id = {client.id}>
        {#if editLine === g}
          <input class="input"
                 type="text" 
                 bind:value="{client.name}" 
                 on:input={() => editClientName(client.id, client.name)}
                 placeholder="Client name">
        {:else}
          <FontAwesomeIcon icon={faSatellite} class="icon is-small"/>
          {client.name ? client.name : client.host}
        {/if}
      </div>
    {/each}
  </div>
{/each}
{#if newGroup}
  <div 
    class="list is-hoverable basket"
    on:drop|preventDefault={event => drop(event, null)}
    ondragover="return false"
    on:dragenter="{() => hovering = $snapGroups.length}"
    on:dragleave="{() => hovering = null}"
    class:hovering="{hovering === $snapGroups.length}"
    >
    <div class="list-item">
      New Group 
    </div>
  </div>
{/if}

<br>
<h2 class="subtitle">Mopidy server</h2>

<div class="columns is-multiline">
  <div class="column is-12-mobile is-4-desktop">
    <div class="field">
      <label class="label">Hostname</label>
      <div class="control">
        <input class="input is-rounded"
               type="text" 
               bind:value="{$mopidyHost}" 
               placeholder="Hostname">
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-4-desktop">
    <div class="field">
      <label class="label">Port</label>
      <div class="control">
        <input class="input is-rounded"
               type="text" 
               bind:value="{$mopidyPort}" 
               placeholder="Port">
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-4-desktop">
    <label class="label">SSL</label>
    <div class="control">
      <div class="select">
        <select bind:value={$mopidySSL}>
          <option value="">http</option>
          <option value="1">https</option>
        </select>
      </div>
    </div>
  </div>

  <div class="column is-12-mobile is-6-desktop">
    <div class="field is-grouped is-grouped-multiline">
      <p class="control">
        <a class="button" href="{null}" on:click={() => promiseMopidy = connectWS(true)}>Connect</a>
      </p>
      <p class="control">
        {#if promiseMopidy}
          {#await promiseMopidy}
            <button class="button">
              <FontAwesomeIcon icon={faSpinner} spin={true} class="icon"/>
            </button>
          {:then _}
            <button class="button is-success" disabled>
              Connected
            </button>
          {:catch error}
            <button class="button is-danger" disabled>
              {error.message}
            </button>
          {/await}
        {/if}
      </p>
    </div>
  </div>

</div>

<hr>

<label class="label">Image Provider</label>
<div class="control">
  <div class="select">
    <select bind:value={$imageProvider}>
      <option value="local">Local</option>
      <option value="lastfm">LastFM</option>
    </select>
  </div>
</div>


<script>
  import { onMount } from 'svelte';
  import { connectSnapcast } from '../tools/snapcast';
  import { connectWS } from '../tools/mopidyTools';
  import { snapGroups, imageProvider, mopidyHost, mopidyPort, mopidySSL, snapcastHost, snapcastPort, snapcastSSL } from '../tools/stores';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faSpinner,
    faSatellite,
    faEdit,
    faCheckCircle
  } from '@fortawesome/free-solid-svg-icons';
  import { editGroupName, editClientName, setGroupClients } from '../tools/snapcast';
  let promise;
  let promiseMopidy;
  let hovering = false;
  let hoveringList = {};
  let editLine;
  let newGroup;

  onMount(() => {
    $mopidyHost = $mopidyHost ? $mopidyHost : window.location.hostname;
    $mopidyPort = $mopidyPort ? $mopidyPort : window.location.port;
    $mopidySSL = $mopidySSL ? $mopidySSL : window.location.protocol === 'https:' ? "1" : "";
    $snapcastHost = $snapcastHost ? $snapcastHost : window.location.hostname;
    $snapcastPort = $snapcastPort ? $snapcastPort : window.location.port;
    $snapcastSSL = $snapcastSSL ? $snapcastSSL : window.location.protocol === 'https:' ? "1" : "";
  })

  export function dragstart (ev, group, item) {
    newGroup = true;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.dropEffect = 'move';
    let obj = {group: group, item: item, id: ev.target.getAttribute('id')};
    ev.dataTransfer.setData('text/plain', JSON.stringify(obj));
  }

  export function drop (ev, new_g) {
    ev.dataTransfer.dropEffect = 'move';
    let json_obj = ev.dataTransfer.getData("text/plain");
    let obj = JSON.parse(json_obj);
    let i = obj.item;
    let old_g = obj.group;
    const item = $snapGroups[old_g].clients.splice(i,1)[0];
    if (new_g) {
      $snapGroups[new_g].clients = [...$snapGroups[new_g].clients,item];
      setGroupClients($snapGroups[new_g].id, $snapGroups[new_g].clients.map(client => client.id))
    } else {
      setGroupClients($snapGroups[old_g].id, $snapGroups[old_g].clients.map(client => client.id))
    }
    hovering = null;
    newGroup = false;
  }

</script>

<style>
  .input {
    -moz-appearance: none;
    -webkit-appearance: none;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 4px;
    box-shadow: none;
    display: inline-flex;
    font-size: 1rem;
    height: 2.5em;
    justify-content: flex-start;
    line-height: 1.5;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
    position: relative;
    vertical-align: top;
  }

  .input.is-rounded {
    border-radius: 290486px;
    padding-left: calc(calc(0.75em - 1px) + 0.375em);
    padding-right: calc(calc(0.75em - 1px) + 0.375em);
  }

  .input {
    background-color: white;
    border-color: #dbdbdb;
    border-radius: 4px;
    color: #363636;
  }

  .input::-moz-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input::-webkit-input-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:-moz-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:-ms-input-placeholder {
    color: rgba(54, 54, 54, 0.3);
  }

  .input:hover {
    border-color: #b5b5b5;
  }

  .input:focus {
    border-color: #3273dc;
    box-shadow: 0 0 0 0.125em rgba(50, 115, 220, 0.25);
  }

  .input {
    box-shadow: inset 0 0.0625em 0.125em rgba(10, 10, 10, 0.05);
    max-width: 100%;
    width: 100%;
  }

  .field:not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .label {
    color: #363636;
    display: block;
    font-size: 1rem;
    font-weight: 700;
  }

  .label:not(:last-child) {
    margin-bottom: 0.5em;
  }

  .control {
    box-sizing: border-box;
    clear: both;
    font-size: 1rem;
    position: relative;
    text-align: left;
  }

  .select:not(.is-multiple):not(.is-loading)::after {
    border: 3px solid transparent;
    border-radius: 2px;
    border-right: 0;
    border-top: 0;
    content: " ";
    display: block;
    height: 0.625em;
    margin-top: -0.4375em;
    pointer-events: none;
    position: absolute;
    top: 50%;
    transform: rotate(-45deg);
    transform-origin: center;
    width: 0.625em;
  }

  .select select {
    -moz-appearance: none;
    -webkit-appearance: none;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 4px;
    box-shadow: none;
    display: inline-flex;
    font-size: 1rem;
    height: 2.5em;
    justify-content: flex-start;
    line-height: 1.5;
    padding-bottom: calc(0.5em - 1px);
    padding-left: calc(0.75em - 1px);
    padding-right: calc(0.75em - 1px);
    padding-top: calc(0.5em - 1px);
    position: relative;
    vertical-align: top;
  }

  .field.is-grouped {
    display: flex;
    justify-content: flex-start;
  }

  .field.is-grouped > .control {
    flex-shrink: 0;
  }

  .field.is-grouped > .control:not(:last-child) {
    margin-bottom: 0;
    margin-right: 0.75rem;
  }

  .field.is-grouped.is-grouped-multiline {
    flex-wrap: wrap;
  }

  .field.is-grouped.is-grouped-multiline > .control:last-child, .field.is-grouped.is-grouped-multiline > .control:not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .field.is-grouped.is-grouped-multiline:last-child {
    margin-bottom: -0.75rem;
  }

  .field.is-grouped.is-grouped-multiline:not(:last-child) {
    margin-bottom: 0;
  }

  .field.has-addons .control:not(:first-child):not(:last-child) .button,
  .field.has-addons .control:not(:first-child):not(:last-child) .input {
    border-radius: 0;
  }

  .field.has-addons .control:first-child:not(:only-child) .button,
  .field.has-addons .control:first-child:not(:only-child) .input {
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
  }

  .field.has-addons .control:last-child:not(:only-child) .button,
  .field.has-addons .control:last-child:not(:only-child) .input {
    border-bottom-left-radius: 0;
    border-top-left-radius: 0;
  }

  .field.has-addons .control .button:not([disabled]):hover,
  .field.has-addons .control .input:not([disabled]):hover {
    z-index: 2;
  }

  .field.has-addons .control .button:not([disabled]):focus, .field.has-addons .control .button:not([disabled]):active, .field.has-addons .control .input:not([disabled]):focus, .field.has-addons .control .input:not([disabled]):active {
    z-index: 3;
  }

  .field.has-addons .control .button:not([disabled]):focus:hover, .field.has-addons .control .button:not([disabled]):active:hover, .field.has-addons .control .input:not([disabled]):focus:hover, .field.has-addons .control .input:not([disabled]):active:hover {
    z-index: 4;
  }

  .hovering {
    border: 1px solid orange;
  }
  .hovering * {
    pointer-events: none; /* so that a child hover child is not a "dragleave" event */
  }

  .basket {
    min-height: 24px;
  }

</style>

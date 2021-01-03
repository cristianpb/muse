{#if $snapGroups.length > 0}
  <div class="columns is-multiline">
    <div class="column is-12">
      <aside class="menu">
        {#each $snapGroups as group, g}
          <div class="menu-label"
               on:drop|preventDefault={event => drop(event, g)}
               ondragover="return false"
               on:dragenter="{() => hovering = group.name}"
               on:dragleave="{() => hovering = null}"
               class:hovering="{hovering === group.name}"
               >
               <b>Group {group.name ? `${group.name} - ` : ''}{group.id}</b>
               {#if editLine === true}
                 <input class="input"
                        type="text" 
                        bind:value="{group.name}" 
                        on:input={() => editGroupName(group.id, group.name)}
                        placeholder="Group name">
               {/if}
          </div>
          <ul class="menu-list">
            {#each group.clients as client, i}
              <li
                draggable={true} 
                on:dragstart={event => dragstart(event, g, i)}
                on:mouseenter={() => hoveringList = {group: g, client: i}}
                on:mouseleave={() => hoveringList = {}}
                class:hover={hoveringList.group === g && hoveringList.client === i}
                id = {client.id}
                >
                <div class="columns is-mobile is-gapless">
                  <div class="column">
                    <a href={null}>
                      {#if client.connected}
                        <FontAwesomeIcon icon={faSatellite} class="icon is-small"/>
                      {:else}
                        <FontAwesomeIcon icon={faUnlink} class="icon is-small"/>
                      {/if}
                      {client.name ? client.name : client.host}
                    </a>
                  </div>
                  {#if editLine === true}
                    <div class="column">
                      <input class="input"
                             type="text" 
                             bind:value="{group.clients[i].name}" 
                             on:input={() => editClientName(group.clients[i].id, group.clients[i].name)}
                             placeholder="Client name">
                    </div>
                    <div class="column is-narrow" on:click="{deleteClient(client.id)}">
                      <button class="button">
                        <FontAwesomeIcon icon={faTrash} class="icon"/>
                      </button>
                    </div>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        {/each}
        {#if newGroup}
          <br>
          <button class="button is-fullwidth"
                  on:drop|preventDefault={event => drop(event, null)}
                  ondragover="return false"
                  on:dragenter="{() => hovering = $snapGroups.length}"
                  on:dragleave="{() => hovering = null}"
                  class:hovering="{hovering === $snapGroups.length}"
                  >
                  New group
          </button>
        {/if}
      </aside>
    </div>

    <div class="column is-12">
      <a class="button" href="{null}" on:click={() => editLine = !editLine}>
        {#if editLine === true}
          <FontAwesomeIcon icon={faCheckCircle} class="icon"/>&nbsp;&nbsp; Finish edition
        {:else}
          <FontAwesomeIcon icon={faEdit} class="icon"/>&nbsp;&nbsp; Edit clients name
        {/if}
      </a>
    </div>
  </div>
{/if}

<script>
  import { snapGroups } from '../tools/stores';
  import { editGroupName, editClientName, deleteClient, setGroupClients } from '../tools/snapcast';
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import {
    faSatellite,
    faEdit,
    faCheckCircle,
    faUnlink,
    faTrash
  } from '@fortawesome/free-solid-svg-icons';
  let hovering = false;
  let hoveringList = {};
  let editLine;
  let newGroup;
  
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

  export function dragstart (ev, group, item) {
    newGroup = true;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.dropEffect = 'move';
    let obj = {group: group, item: item, id: ev.target.getAttribute('id')};
    ev.dataTransfer.setData('text/plain', JSON.stringify(obj));
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
  .hovering {
    border: 1px solid orange;
  }
  .hovering * {
    pointer-events: none; /* so that a child hover child is not a "dragleave" event */
  }

  .menu {
    font-size: 1rem;
  }

  .menu-list {
    line-height: 1.25;
  }

  .menu-list a {
    border-radius: 2px;
    color: #4a4a4a;
    display: block;
    padding: 0.5em 0.75em;
  }

  .menu-list a:hover {
    background-color: whitesmoke;
    color: #363636;
  }

  .menu-label {
    color: #7a7a7a;
    font-size: 0.75em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .menu-label:not(:first-child) {
    margin-top: 1em;
  }

  .menu-label:not(:last-child) {
    margin-bottom: 1em;
}

</style>


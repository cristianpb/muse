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
             <b>Group {group.name ? `${group.name} - ` : ''}{group.id}</b>
           </div>
           <div class="column">
             {#if editLine === g}
               <input class="input"
                      type="text" 
                      bind:value="{group.name}" 
                      on:input={() => editGroupName(group.id, group.name)}
                      placeholder="Group name">
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
        <div class="columns is-mobile">
          <div class="column">
            {#if client.connected}
              <FontAwesomeIcon icon={faSatellite} class="icon is-small"/>
            {:else}
              <FontAwesomeIcon icon={faUnlink} class="icon is-small"/>
            {/if}
            {client.name ? client.name : client.host}
          </div>
          {#if editLine === g}
          <div class="column">
              <input class="input"
                     type="text" 
                     bind:value="{group.clients[i].name}" 
                     on:input={() => editClientName(group.clients[i].id, group.clients[i].name)}
                     placeholder="Client name">
          </div>
          <div class="column is-narrow" on:click="{deleteClient(client.id)}">
            <FontAwesomeIcon icon={faTrash} class="icon"/>
          </div>
          {/if}
        </div>
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


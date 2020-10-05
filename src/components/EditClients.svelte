<div class="modal" class:is-active={$snapClientsEditVisibility}  >
    <div class="modal-background" on:click={() => $snapClientsEditVisibility = !$snapClientsEditVisibility}></div>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Edit Snapcast Clients</p>
      <a href="{null}" aria-label="close" on:click={() => $snapClientsEditVisibility = !$snapClientsEditVisibility}>
        <FontAwesomeIcon icon={faTimesCircle} class="icon"/>
      </a>
    </header>
    <section class="modal-card-body">
      <div class="columns is-multiline">
        {#each $snapGroups as group}
          <div class="column is-12">
            <div class="field has-addons">
              <div class="control is-expanded">
                <label class="label">Group ID: {group.id}
                  <input class="input"
                         type="text" 
                         bind:value="{group.name}" 
                         placeholder="Group name">
                </label>
              </div>
              <div class="control">
                <div class="button is-info" 
                     on:click={editGroupName(group.id, group.name)}>
                  Save
                </div>
              </div>
            </div>
          {#each group.clients as client, idx}
            <div class="columns is-mobile">
              <div class="column is-12">
                <div class="field has-addons">
                  <div class="control is-expanded">
                    <label class="label">Client ID: {client.id}
                      <input class="input"
                             type="text" 
                             bind:value="{group.clients[idx].name}" 
                             placeholder="Client name">
                    </label>
                  </div>
                  <div class="control">
                    <div class="button is-info" 
                         on:click={editClientName(client.id, client.name)}>
                      Save
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
          </div>
        {/each}
      </div>
    </section>
  </div>
  <button class="modal-close is-large" aria-label="close" on:click={() => $snapClientsEditVisibility = !$snapClientsEditVisibility}></button>
</div>

<script>
  import FontAwesomeIcon from '../components/FontAwesomeIcon.svelte'
  import { snapGroups, snapClientsEditVisibility } from '../tools/stores';
  import {
    faTimesCircle,
  } from '@fortawesome/free-solid-svg-icons';
  import { editGroupName, editClientName } from '../tools/snapcast';

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

.field.has-addons {
  display: flex;
  justify-content: flex-start;
}

.field.has-addons .control:not(:last-child) {
  margin-right: -1px;
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

.field.has-addons .control.is-expanded {
  flex-grow: 1;
  flex-shrink: 1;
}

.field.has-addons .control.is-expanded {
  flex-grow: 1;
  flex-shrink: 1;
}


</style>


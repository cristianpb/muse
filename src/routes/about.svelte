<script>
  import { onMount } from 'svelte';
  import Mopidy from "mopidy";
  
  let currentTrack
  onMount(async () => {

    const mopidy = new Mopidy({
      webSocketUrl: "ws://10.3.141.129:6680/mopidy/ws/",
      //webSocketUrl: "ws://localhost:6680/mopidy/ws/",
    });

    mopidy.on("state", console.log);
    mopidy.on("event", console.log);

    mopidy.on("state:online", async () => {
      console.log("connected");
      currentTrack = await mopidy.playback.getCurrentTrack()
      console.log(currentTrack);
    });

  })

</script>



<svelte:head>
	<title>About</title>
</svelte:head>

<h1>About this site</h1>

{#if currentTrack}
<p>{currentTrack.name}</p>
<p>{currentTrack.artists[0].name}</p>
{/if}


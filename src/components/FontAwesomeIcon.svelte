<svg
  aria-hidden="true"
  class="{classes}"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
  viewBox="{viewBox}"
>
  <path fill="currentColor" d="{path}" />
</svg>
<script>
  export let icon;
  let path = [];
  let classes = "";
  let viewBox = "";
  $: viewBox = "0 0 " + icon.icon[0] + " " + icon.icon[1];
  $: classes = "fa " + ($$props.class ? $$props.class : "");
  $: path = icon.icon[4];
</script>

<style>

.fa {
  align-items:center;
  display:inline-flex;
  justify-content:center;
  height:1.25rem;
  width:1.25rem;
}

  .is-low {
      margin-bottom: -0.25rem;
  }

  .is-lower {
      margin-bottom: -0.35rem;
  }

  .is-48 {
      margin-top: 8px;
      width: 48px;
      height: 48px;
  }

  .is-36 {
      margin-top: 4px!important;
      width: 36px;
      height: 36px;
  }

  .is-24 {
      vertical-align: -0.35em;
      width: 24px;
      height: 24px;
  }

  .is-info {
    color:#209cee;
  }

  .is-small {
      height: .75rem !important;
      width: .75rem !important;
  }

  .is-small.is-low {
      margin-bottom: -0.15rem!important;
  }

</style>

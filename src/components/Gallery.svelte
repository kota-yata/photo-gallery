<script lang="ts">
  const imageData: string[][] = [
    ['la', 'citadel', 'parking'],
    ['la', 'redondo', 'beach'],
    ['la', 'redondo', 'pier'],
    ['la', 'beverlyhills'],
    ['la', 'originalfarmersmarket', 'crowded'],
    ['mug', 'mac'],
    ['la', 'hollywood'],
    ['la', 'redondo', 'pier', 'fishing'],
    ['la', 'hollywood', 'shopping'],
    ['la', 'beverlyhills', 'park'],
    ['la', 'citadel', 'starbucks'],
    ['la', 'ucla'],
    ['la', 'ucla'],
    ['la', 'ucla'],
    ['la', 'santamonica', 'traffic'],
    ['la', 'santamonica'],
    ['la', 'santamonica'],
    ['la', 'santamonica', 'sea'],
    ['la', 'carlsbad', 'road'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['la', 'hollywood', 'universalstudios'],
    ['keyboard', 'hhkb'],
    ['microphone', 'marantz'],
    ['la', 'disneyland', 'anaheim'],
    ['la', 'redondo'],
    ['la', 'hollywood'],
    ['la', 'redondo', 'beach'],
    ['la', 'hollywood', 'roosevelthotel'],
    ['la', 'redondo', 'beach'],
    ['la', 'redondo', 'pier'],
    ['la', 'redondo', 'tree'],
    ['la', 'redondo', 'bike'],
  ];

  window.addEventListener('DOMContentLoaded', (): void => {
    lazyload();
  });
</script>

<div class="photo-container">
  {#each imageData as tags, i}
    <div class="photo">
      <img alt="img" class="lazyload" data-src="./img-pc/{i}.jpg" />
      <div class="tag-container">
        {#each tags as tag, i}<span class="tag {tag}">#{tag}</span>{/each}
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  @import '../assets/definition.scss';

  .photo-container {
    @extend %center;
    column-count: 3;
    column-gap: 0;
    .photo {
      padding: 10px 5px;
      page-break-inside: avoid;
      break-inside: avoid;
      display: inline-block;
      img {
        width: 23vw;
      }
      .tag-container {
        .tag {
          padding: 5px;
          margin: 2px 5px;
          background: $pg-green;
          color: $general-white;
          border-radius: 10px;
        }
      }
    }
  }
</style>

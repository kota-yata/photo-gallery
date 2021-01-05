<script lang="ts">
  export let resultArray: imageArray[];
</script>

<div class="photo-container">
  {#each resultArray as { index, tags }, i}
    <div class="photo">
      <div class="for-tag">
        <a class="data-img" href="https://pics.kota-yata.com/img-pc/{i}.jpg"><img
            alt="img"
            src="./img-pc/{index}.jpg"
          /></a>
        <div class="tag-container">
          {#each tags as tag, i}<span class="tag {tag}">#{tag}</span>{/each}
        </div>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  @import '../assets/definition.scss';

  .photo-container {
    display: relative;
    column-count: 3;
    column-gap: 0;
    .photo {
      padding: 10px 5px;
      page-break-inside: avoid;
      break-inside: avoid;
      display: inline-block;
      .for-tag {
        position: relative;
        width: 100%;
        .data-img {
          cursor: zoom-in;
          img {
            filter: contrast(80%);
            width: 25vw;
            transition: 0.2s;
          }
        }
        .tag-container {
          position: absolute;
          bottom: 5px;
          height: 40px;
          display: flex;
          align-items: center;
          transition: 0.2s;
          opacity: 0;
          visibility: hidden;
          text-align: left;
          width: 100%;
          background: $transparent-white;
          .tag {
            cursor: pointer;
            padding: 5px;
            margin: 2px 5px;
            color: $pg-green;
            border-radius: 10px;
          }
        }
        .data-img:hover {
          & + .tag-container {
            opacity: 1;
            visibility: visible;
            transition: 0.2s;
          }
        }
        .tag-container:hover {
          opacity: 1;
          visibility: visible;
          transition: 0.2s;
        }
      }
    }
  }

  @media screen and (max-width: 1300px) {
    .photo-container {
      column-count: 2;
      .photo {
        .for-tag {
          .data-img img {
            width: 38vw;
          }
        }
      }
    }
  }

  @media screen and (max-width: 1000px) {
    .photo-container {
      .photo {
        .for-tag {
          .tag-container {
            width: 100%;
            position: relative;
            opacity: 1;
            visibility: visible;
          }
        }
      }
    }
  }

  @media screen and (max-width: 750px) {
    .photo-container {
      column-count: 1;
      .photo {
        padding: 10px 0;
        .for-tag {
          .data-img img {
            width: 100vw;
          }
        }
      }
    }
  }
</style>

<script lang="ts">
  import Footer from './components/Footer.svelte';
  import Gallery from './components/Gallery.svelte';
  import { subjectArray } from './components/Data.svelte';

  let searchWords: string;
  $: resultArray = (): imageArray[] => {
    if (searchWords === 'ALL' || !searchWords) {
      return subjectArray;
    }
    return subjectArray.filter((img) => {
      img.tags.includes(searchWords);
    });
  };
</script>

<main>
  <div id="header">
    <div id="logo">
      <a href="https://kota-yata.com"><h1>KOTA-YATA pics</h1></a>
    </div>
    <div id="search_box">
      <label id="search_box_contents">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="hollywood" name="search" id="search" bind:value="{searchWords}" />
      </label>
    </div>
  </div>
  <div id="img_container">
    <Gallery resultArray="{resultArray()}" />
  </div>
  <Footer />
</main>

<style lang="scss">
  @import './assets/definition.scss';

  main {
    font-family: 'Poppins';
    #header {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      #logo {
        h1 {
          margin: 0;
          font-size: 35px;
          color: $pg-green;
        }
      }
      #search_box {
        display: flex;
        align-items: center;
        background: $pg-green;
        width: 30vw;
        border-radius: 10px;
        &_contents {
          cursor: text;
          display: flex;
          align-items: center;
          padding-left: 20px;
          padding-right: 10px;
          width: calc(100% - 30px);
          height: 100%;
          color: $general-white;
          i {
            font-size: 25px;
            padding-right: 10px;
          }
          input {
            height: 100%;
            width: calc(100% - 35px);
            background: transparent;
            font-size: 20px;
            color: $general-white; // 指定しないとinputのデフォルトカラーになる
            &::placeholder {
              color: $light-white;
            }
          }
        }
      }
    }
  }

  #img_container {
    @extend %center;
    margin-top: 5vh;
    width: 80vw;
  }

  @media screen and (max-width: 750px) {
    main {
      #header {
        padding: 10px;
        #logo {
          h1 {
            font-size: 20px;
          }
        }
        #search_box {
          width: 40vw;
          &_contents {
            padding-left: 10px;
            padding-right: 5px;
            width: calc(100% - 15px);
            i {
              font-size: 15px;
              padding-right: 5px;
            }
            input {
              width: calc(100% - 16px);
              font-size: 13px;
            }
          }
        }
      }
      #img_container {
        width: 100vw;
      }
    }
  }
</style>

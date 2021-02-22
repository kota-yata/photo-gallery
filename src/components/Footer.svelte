<footer class="footer">
  <div class="footer-license">
    <span class="footer-license-words">All photos can be downloaded and used for free on any purpose</span>
  </div>
  <div class="footer-name">
    <h2>© 2021 Kota Yatagai</h2>
  </div>
</footer>

<style lang="scss">
  @import '../assets/definition.scss';

  .footer {
    @extend %center;
    @extend %gradient-text;
    width: 100vw;
    margin-top: 3vh;
    padding: 20px 0;
    &-license {
      display: flex;
      flex-direction: column;
      &-words {
        font-size: 15px;
      }
    }
    &-name {
      h2 {
        margin: 10px 0;
      }
    }
  }

  @media screen and (max-width: 750px) {
    .footer {
      &-license {
        &-words {
          font-size: 12px;
        }
      }
    }
  }
</style>

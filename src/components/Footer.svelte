<div class="footer">
  <div class="footer-license">
    <span class="footer-license-words">All photos can be downloaded and used for free on any purpose</span>
  </div>
  <div class="footer-name">
    <h2>© 2021 Kota Yatagai</h2>
  </div>
</div>

<style lang="scss">
  @import '../assets/definition.scss';

  .footer {
    @extend %center;

    width: 100vw;
    border-top: 2px $pg-green solid;
    margin-top: 3vh;
    padding: 20px 0;
    color: $pg-green;
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

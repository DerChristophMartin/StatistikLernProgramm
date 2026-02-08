<div class="spinner"></div>

<style>
  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid var(--bg-tertiary);
    border-top-color: var(--accent-color);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>

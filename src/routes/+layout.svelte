<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>Kuiz!</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="container">
	<header class="header">
		<h1>Kuiz!</h1>
		<p>의대생을 위한 학습 도구</p>
	</header>
	<main>
		{@render children?.()}
	</main>
</div>

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
	
	:global(body) {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
		color: #333;
	}
	
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.header {
		text-align: center;
		margin-bottom: 2rem;
		color: white;
	}
	
	.header h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
	}
	
	.header p {
		font-size: 1.1rem;
		opacity: 0.9;
	}
	
	:global(.card) {
		background: white;
		border-radius: 15px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0,0,0,0.2);
		margin-bottom: 2rem;
	}
	
	:global(.btn) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-size: 1rem;
		cursor: pointer;
		transition: all 0.3s ease;
		text-decoration: none;
		display: inline-block;
		text-align: center;
	}
	
	:global(.btn:hover) {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(0,0,0,0.2);
	}
	
	:global(.btn:disabled) {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}
	
	:global(.btn-secondary) {
		background: #6c757d;
	}
	
	:global(.btn-success) {
		background: #28a745;
	}
	
	:global(.btn-danger) {
		background: #dc3545;
	}
	
	:global(.input) {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s ease;
	}
	
	:global(.input:focus) {
		outline: none;
		border-color: #667eea;
	}
	
	:global(.progress-bar) {
		width: 100%;
		height: 8px;
		background: #e9ecef;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 1rem;
	}
	
	:global(.progress-fill) {
		height: 100%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		transition: width 0.3s ease;
	}
</style>

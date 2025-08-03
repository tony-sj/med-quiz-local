<script lang="ts">
	import { onMount } from 'svelte';
	
	export let src: string;
	export let alt: string = '';
	export let className: string = '';
	export let placeholder: string = '이미지 로딩 중...';
	
	let img: HTMLImageElement;
	let loaded = false;
	let error = false;
	let observer: IntersectionObserver;
	
	onMount(() => {
		// Intersection Observer로 지연 로딩 구현
		if ('IntersectionObserver' in window) {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach(entry => {
						if (entry.isIntersecting) {
							loadImage();
							observer.unobserve(entry.target);
						}
					});
				},
				{ threshold: 0.1 } // 10% 보이면 로딩 시작
			);
			
			if (img) {
				observer.observe(img);
			}
		} else {
			// Intersection Observer가 지원되지 않으면 즉시 로딩
			loadImage();
		}
		
		return () => {
			if (observer) {
				observer.disconnect();
			}
		};
	});
	
	function loadImage() {
		if (loaded || error) return;
		
		const imageLoader = new Image();
		imageLoader.onload = () => {
			loaded = true;
			if (img) {
				img.src = src;
			}
		};
		imageLoader.onerror = () => {
			error = true;
		};
		imageLoader.src = src;
	}
</script>

<div class="lazy-image-container {className}" bind:this={img}>
	{#if loaded}
		<img {src} {alt} class="lazy-image loaded" loading="lazy" />
	{:else if error}
		<div class="lazy-image-error">
			<span>이미지를 불러올 수 없습니다</span>
		</div>
	{:else}
		<div class="lazy-image-placeholder">
			<span>{placeholder}</span>
		</div>
	{/if}
</div>

<style>
	.lazy-image-container {
		position: relative;
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f5f5f5;
		border-radius: 8px;
		overflow: hidden;
	}
	
	.lazy-image {
		width: 100%;
		height: auto;
		max-width: 100%;
		transition: opacity 0.3s ease;
	}
	
	.lazy-image.loaded {
		opacity: 1;
	}
	
	.lazy-image-placeholder,
	.lazy-image-error {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		min-height: 200px;
		color: #666;
		font-size: 14px;
	}
	
	.lazy-image-error {
		color: #ff6b6b;
		background-color: #fff5f5;
	}
	
	.lazy-image-placeholder {
		animation: pulse 2s infinite;
	}
	
	@keyframes pulse {
		0% { opacity: 1; }
		50% { opacity: 0.5; }
		100% { opacity: 1; }
	}
</style>

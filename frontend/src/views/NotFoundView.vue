<script setup lang="ts">
</script>

<template>
  <div class="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-50"></div>
    </div>

    <div class="relative z-10 max-w-lg mx-auto">
      <div class="mb-8 relative inline-block">
        <h1 class="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary/20 to-primary/5 select-none animate-pulse">
          404
        </h1>
        <div class="absolute inset-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-primary animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <h2 class="text-3xl md:text-4xl font-bold text-secondary mb-4 tracking-tight">
        {{ $t('notFound.title') }}
      </h2>
      
      <p class="text-gray-500 text-lg mb-8 leading-relaxed max-w-md mx-auto">
        {{ $t('notFound.message') }}
      </p>

      <router-link 
        to="/" 
        class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-gradient text-white font-bold shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-primary/50 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ $t('notFound.button') }}
      </router-link>
    </div>
  </div>
</template>

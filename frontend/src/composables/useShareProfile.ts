import { ref, type Ref } from 'vue';
import type { MissingPerson } from '../types';

const copiedTooltipDurationMs = 2000;

export function useShareProfile(
  person: Ref<MissingPerson | null>,
  getShareMessage: () => string,
  getShareUrl?: () => string,
) {
  const isShareModalOpen = ref(false);
  const showCopiedTooltip = ref(false);

  const getUrl = () => (getShareUrl ? getShareUrl() : window.location.href);

  const shareProfile = async () => {
    if (!person.value) return;

    const shareData = {
      title: `Alerta360: ${person.value.name}`,
      text: getShareMessage(),
      url: getUrl(),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      isShareModalOpen.value = true;
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getUrl());
    showCopiedTooltip.value = true;
    setTimeout(() => {
      showCopiedTooltip.value = false;
    }, copiedTooltipDurationMs);
  };

  const shareToSocial = (network: string) => {
    if (!person.value) return;

    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(getShareMessage());

    let shareUrl = '';
    switch (network) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return {
    shareProfile,
    copyLink,
    shareToSocial,
    isShareModalOpen,
    showCopiedTooltip,
  };
}

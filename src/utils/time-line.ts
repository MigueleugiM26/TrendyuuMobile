// Utilitários para o sistema de timeline não linear

export interface TimelineElement {
  id: string;
  type:
    | "audio"
    | "effect"
    | "filter"
    | "theme"
    | "video"
    | "subtitle"
    | "transition"
    | "splitscreen"
    | "image"
    | "segment"
    | "overlay"
    | "caption";
  startTime: number;
  duration: number;
  endTime?: number;
}

/**
 * Verifica se um elemento está ativo no tempo atual
 */
export function isElementActive(
  element: TimelineElement,
  currentTime: number
): boolean {
  const endTime = element.endTime || element.startTime + element.duration;
  return currentTime >= element.startTime && currentTime < endTime;
}

/**
 * Obtém todos os elementos ativos no tempo atual
 */
export function getActiveElements<T extends TimelineElement>(
  elements: T[],
  currentTime: number
): T[] {
  return elements.filter((element) => isElementActive(element, currentTime));
}

/**
 * Verifica se dois elementos se sobrepõem no tempo
 */
export function elementsOverlap(
  element1: TimelineElement,
  element2: TimelineElement
): boolean {
  const end1 = element1.endTime || element1.startTime + element1.duration;
  const end2 = element2.endTime || element2.startTime + element2.duration;

  return !(end1 <= element2.startTime || element1.startTime >= end2);
}

/**
 * Remove elementos que se sobrepõem com um novo elemento
 */
export function removeOverlappingElements<T extends TimelineElement>(
  existingElements: T[],
  newElement: TimelineElement,
  elementType?: string
): T[] {
  return existingElements.filter((element) => {
    // Se especificado um tipo, só remover elementos do mesmo tipo
    if (elementType && element.type !== elementType) return true;

    return !elementsOverlap(element, newElement);
  });
}

/**
 * Calcula a duração total da timeline baseada em todos os elementos
 */
export function calculateTimelineDuration(elements: TimelineElement[]): number {
  if (elements.length === 0) return 0;

  return Math.max(
    ...elements.map((element) => {
      const endTime = element.endTime || element.startTime + element.duration;
      return endTime;
    })
  );
}

/**
 * Obtém elementos por tipo
 */
export function getElementsByType<T extends TimelineElement>(
  elements: T[],
  type: string
): T[] {
  return elements.filter((element) => element.type === type);
}

/**
 * Verifica se um tempo específico está dentro de algum elemento de um tipo
 */
export function isTimeInElementType(
  elements: TimelineElement[],
  currentTime: number,
  elementType: string
): boolean {
  const elementsOfType = getElementsByType(elements, elementType);
  return elementsOfType.some((element) =>
    isElementActive(element, currentTime)
  );
}

/**
 * Obtém o próximo elemento que será ativado
 */
export function getNextActiveElement<T extends TimelineElement>(
  elements: T[],
  currentTime: number
): T | null {
  const futureElements = elements
    .filter((element) => element.startTime > currentTime)
    .sort((a, b) => a.startTime - b.startTime);

  return futureElements[0] || null;
}

/**
 * Obtém o elemento anterior que foi desativado
 */
export function getPreviousActiveElement<T extends TimelineElement>(
  elements: T[],
  currentTime: number
): T | null {
  const pastElements = elements
    .filter((element) => {
      const endTime = element.endTime || element.startTime + element.duration;
      return endTime <= currentTime;
    })
    .sort((a, b) => {
      const endA = a.endTime || a.startTime + a.duration;
      const endB = b.endTime || b.startTime + b.duration;
      return endB - endA;
    });

  return pastElements[0] || null;
}

/**
 * Formata tempo em segundos para string MM:SS
 */
export function formatTimelineTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Converte posição do mouse na timeline para tempo
 */
export function mousePositionToTime(
  mouseX: number,
  timelineWidth: number,
  totalDuration: number,
  timelineScale = 1
): number {
  const percentage = mouseX / (timelineWidth * timelineScale);
  return percentage * totalDuration;
}

/**
 * Converte tempo para posição na timeline
 */
export function timeToPosition(
  time: number,
  totalDuration: number,
  timelineWidth: number,
  timelineScale = 1
): number {
  const percentage = time / totalDuration;
  return percentage * timelineWidth * timelineScale;
}

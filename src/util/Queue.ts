export class Queue<T> {
    private elements: T[] = []

    public enqueue(element: T): void {
        this.elements.push(element)
    }

    public  dequeue(): T | undefined {
        return this.elements.shift()
    }

    public isEmpty(): boolean {
        return this.elements.length === 0
    }

    public clearAll(): void {
        this.elements.length = 0
    }
}

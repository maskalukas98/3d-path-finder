export class Cursor {
    private static pointerCursor = "pointer-cursor"
    private static autoCursor = "auto-cursor"

    public static setAutoCursor(): void {
        if(!document.body.classList.contains(Cursor.autoCursor)) {}
        document.body.classList.remove(Cursor.pointerCursor)
        document.body.classList.add(Cursor.autoCursor)
    }

    public static setPointerCursor(): void {
        if(!document.body.classList.contains(Cursor.pointerCursor)) {}
        document.body.classList.remove(Cursor.autoCursor)
        document.body.classList.add(Cursor.pointerCursor)
    }
}
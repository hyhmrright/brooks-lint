export const select=(rows,cursor)=>rows.filter(x=>cursor===undefined||x>cursor);

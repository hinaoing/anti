import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'selections.json');

// Helper to read data
function readData() {
    if (!fs.existsSync(dataFilePath)) {
        return [];
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    try {
        return JSON.parse(fileContent);
    } catch (e) {
        return [];
    }
}

// Helper to write data
function writeData(data: any) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
    const data = readData();
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        writeData(body);
        return NextResponse.json({ message: 'Settings saved successfully' });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}

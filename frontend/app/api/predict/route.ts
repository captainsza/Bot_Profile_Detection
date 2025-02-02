/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/app/api/predict/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const inputData = JSON.stringify(body);
    console.log('Input data:', inputData);

    console.log('Spawning Python process...');
    const pythonProcess = spawn("python", ["./predict.py"]);

    let result = "";
    let errorOutput = "";

    console.log('Sending data to Python process...');
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    return new Promise<Response>((resolve) => {
      pythonProcess.stdout.on("data", (data) => {
        console.log('Received stdout:', data.toString());
        result += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        console.log('Received stderr:', data.toString());
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        console.log('Python process closed with code:', code);
        if (code !== 0) {
          console.error('Python script error:', errorOutput);
          resolve(
            NextResponse.json(
              { error: "Python script error", details: errorOutput },
              { status: 500 }
            )
          );
          return;
        }
        try {
          const jsonResult = JSON.parse(result.trim());
          console.log('Parsed result:', jsonResult);
          resolve(NextResponse.json(jsonResult));
        } catch (e) {
          console.error('Failed to parse output:', result);
          console.error('Parse error:', e);
          resolve(
            NextResponse.json(
              { error: "Failed to parse Python output", details: result },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error: any) {
    console.error('Internal server error:', error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

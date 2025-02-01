/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/predict/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(request: Request) {
        try {
                const body = await request.json();
                const inputData = JSON.stringify(body);
                console.log('Input data:', inputData);

                // Spawn the Python process. Adjust the path to "predict.py" as needed.
                const pythonProcess = spawn("python3", ["./predict.py"]);
                console.log('Python process spawned');

                let result = "";
                let errorOutput = "";

                // Write the input data to the Python process via stdin.
                pythonProcess.stdin.write(inputData);
                pythonProcess.stdin.end();
                console.log('Data written to Python process');

                // Return a promise that resolves when the Python process ends.
                return new Promise((resolve) => {
                        pythonProcess.stdout.on("data", (data) => {
                                result += data.toString();
                                console.log('Received stdout:', data.toString());
                        });
                        pythonProcess.stderr.on("data", (data) => {
                                errorOutput += data.toString();
                                console.error('Received stderr:', data.toString());
                        });
                        pythonProcess.on("close", (code) => {
                                console.log('Python process closed with code:', code);
                                if (code !== 0) {
                                        console.error('Python script error:', errorOutput);
                                        return resolve(
                                                NextResponse.json(
                                                        { error: "Python script error", details: errorOutput },
                                                        { status: 500 }
                                                )
                                        );
                                }
                                try {
                                        const jsonResult = JSON.parse(result);
                                        console.log('Successfully parsed result:', jsonResult);
                                        resolve(NextResponse.json(jsonResult));
                                } catch (e) {
                                        console.error('Failed to parse result:', result);
                                        resolve(
                                                NextResponse.json(
                                                        { error: "Failed to parse Python script output", details: result },
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

//#include <tchar.h>
#include <windows.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <locale.h>

#define PIPENAME "\\\\.\\pipe\\lame-any"
static char pipename[100] = PIPENAME;

#define CMDMPLAYER "mplayer.exe -vc dummy -vo null -format s16le -ao pcm:fast:file="
static char cmdmplayer[4096] = CMDMPLAYER;

#define CMDLAME "lame - "
static char cmdlame[4096] = CMDLAME;

static SECURITY_ATTRIBUTES sa = { sizeof(SECURITY_ATTRIBUTES), NULL, TRUE };
static STARTUPINFO sifo = { 0 };

static void pWin32Error( const char* msg )
{
  DWORD eNum;

  if (msg)
    fprintf(stderr, "%s: ", msg);

  
  eNum = GetLastError( );
  if (0 == FormatMessage( FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
         NULL, eNum,
         MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), // Default language
         (LPSTR )&msg, 0, NULL ))
    return;
  fprintf(stderr, "%s", msg);
  LocalFree((HLOCAL)msg);
}

static void usage(FILE* f)
{
  fprintf(f, 
"Converts to mp3\n"
"usage: lame-any mediafile outputfile.mp3\n"
"\n"
  );
}

int main(int argc, char *argv[]) {
  HANDLE hPipe, hProcs[2];
  PROCESS_INFORMATION pifo;
  DWORD status;
  char *s;

	setlocale( LC_ALL, ".ACP" );
  if (argc < 3) {
    usage(stderr);
    return 1;
  }

  s = pipename+sizeof(PIPENAME) - 1;
  for(status = 0;; status++) {
    itoa(status, s, 10);
    hPipe = CreateNamedPipe(pipename, PIPE_ACCESS_INBOUND, PIPE_TYPE_BYTE | PIPE_WAIT, 1, 2048, 2048, 0, &sa);
    if (hPipe != INVALID_HANDLE_VALUE) break;
    if (GetLastError() != ERROR_PIPE_BUSY) {
      pWin32Error("lame-any: CreateNamedPipe() failed");
      return 1;
    }
  }

  s = cmdmplayer + sizeof(CMDMPLAYER) - 1;
  strcpy(s, pipename);
  s+=strlen(s);
  *(s++) = ' ';
  *(s++) = '\"';
  strcpy(s, argv[1]);
  s+=strlen(s);
  *(s++) = '\"';

  printf("lame-any: %s\n", cmdmplayer); fflush(stdout);
  if (!(CreateProcess(NULL, cmdmplayer, NULL, NULL, TRUE, 0, NULL, NULL, &sifo, &pifo))) {
    pWin32Error("lame-any: CreateProcess(mplayer) failed");
    return 127;
  }
  hProcs[0] = pifo.hProcess;

  if (!ConnectNamedPipe(hPipe, NULL) && GetLastError() != ERROR_PIPE_CONNECTED) {
    pWin32Error("lame-any: ConnectNamedPipe() failed");
    goto cleanmplayer;
  }

  SetStdHandle(STD_INPUT_HANDLE, hPipe);

  s = cmdlame + sizeof(CMDLAME)-1;
  *(s++) = ' ';
  *(s++) = '\"';
  strcpy(s, argv[2]);
  s+=strlen(s);
  *(s++) = '\"';

  printf("lame-any: %s\n", cmdlame); fflush(stdout);
  if (!(CreateProcess(NULL, cmdlame, NULL, NULL, TRUE, 0, NULL, NULL, &sifo, &pifo))) {
    pWin32Error("lame-any: CreateProcess(lame) failed");
    goto cleanmplayer;
  }
  hProcs[1] = pifo.hProcess;

  CloseHandle(hPipe);

  status = WaitForMultipleObjects(2, hProcs, FALSE, INFINITE);
  if (status == WAIT_OBJECT_0) {
    /* mplayer died sooner */
    WaitForSingleObject(hProcs[1], INFINITE);
  } else if (status == WAIT_OBJECT_0 + 1) {
    /* lame died sooner */
    if (WAIT_OBJECT_0 != WaitForSingleObject(hProcs[0], 5000))
      goto cleanmplayer;
  }
  GetExitCodeProcess(hProcs[0], &status);
  if (status == 0)
    GetExitCodeProcess(hProcs[1], &status);
  if (status == 0) {
    printf("lame-any: convert OK\n");
  } else {
    fprintf(stderr, "lame-any: convert failed\n");
  }
  return status;
cleanmplayer:
  TerminateProcess(hProcs[0], 127);
  fprintf(stderr, "lame-any: convert failed\n");
  return 127;
}


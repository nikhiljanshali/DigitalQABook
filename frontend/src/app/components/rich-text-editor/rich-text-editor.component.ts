import { 
  Component, 
  ElementRef, 
  EventEmitter, 
  Input, 
  Output, 
  ViewChild, 
  OnChanges, 
  SimpleChanges,
  AfterViewInit,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="rich-editor-wrapper border border-stone-700 rounded-xl overflow-hidden bg-stone-900 shadow-md">
      
      <!-- Microsoft Word-like Formatting Ribbon Toolbar -->
      <div class="toolbar bg-stone-950/90 border-b border-stone-800 p-1.5 flex flex-wrap items-center gap-1 select-none text-stone-200 text-xs">
        
        <!-- Undo / Redo Group -->
        <div class="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
          <button 
            type="button" 
            (click)="exec('undo')" 
            class="toolbar-btn" 
            title="Undo (Ctrl+Z)"
          >
            <span class="text-sm">↩️</span>
          </button>
          <button 
            type="button" 
            (click)="exec('redo')" 
            class="toolbar-btn" 
            title="Redo (Ctrl+Y)"
          >
            <span class="text-sm">↪️</span>
          </button>
        </div>

        <div class="h-4 w-[1px] bg-stone-800 mx-0.5"></div>

        <!-- Heading / Format Block Dropdown -->
        <select 
          (change)="formatBlock($event)" 
          class="bg-stone-800 text-stone-100 text-xs rounded-lg px-2 py-1 border border-stone-700 focus:outline-none focus:border-amber-500 cursor-pointer"
          title="Text Style"
        >
          <option value="p">Normal Text</option>
          <option value="h2">Heading 1</option>
          <option value="h3">Heading 2</option>
          <option value="h4">Heading 3</option>
          <option value="blockquote">Blockquote</option>
          <option value="pre">Code Block</option>
        </select>

        <div class="h-4 w-[1px] bg-stone-800 mx-0.5"></div>

        <!-- Basic Typography Group (Bold, Italic, Underline, Strikethrough) -->
        <div class="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
          <button 
            type="button" 
            (click)="exec('bold')" 
            class="toolbar-btn font-bold font-serif" 
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button 
            type="button" 
            (click)="exec('italic')" 
            class="toolbar-btn italic font-serif" 
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button 
            type="button" 
            (click)="exec('underline')" 
            class="toolbar-btn underline font-serif" 
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <button 
            type="button" 
            (click)="exec('strikeThrough')" 
            class="toolbar-btn line-through font-serif" 
            title="Strikethrough"
          >
            S
          </button>
        </div>

        <div class="h-4 w-[1px] bg-stone-800 mx-0.5"></div>

        <!-- Colors (Text Color & Highlight) -->
        <div class="flex items-center gap-1 bg-stone-900 rounded-lg px-1.5 py-0.5 border border-stone-800">
          <label class="cursor-pointer flex items-center gap-0.5" title="Font Color">
            <span class="text-xs font-bold text-amber-400">A</span>
            <input 
              type="color" 
              (change)="changeTextColor($event)" 
              class="w-4 h-4 rounded cursor-pointer bg-transparent border-0 opacity-80"
              value="#f59e0b"
            />
          </label>
          <label class="cursor-pointer flex items-center gap-0.5 ml-1" title="Highlight Color">
            <span class="text-xs bg-amber-500/30 px-0.5 rounded text-yellow-300">🖍️</span>
            <input 
              type="color" 
              (change)="changeHighlightColor($event)" 
              class="w-4 h-4 rounded cursor-pointer bg-transparent border-0 opacity-80"
              value="#fef08a"
            />
          </label>
        </div>

        <div class="h-4 w-[1px] bg-stone-800 mx-0.5"></div>

        <!-- Alignment Group -->
        <div class="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
          <button type="button" (click)="exec('justifyLeft')" class="toolbar-btn" title="Align Left">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16"/></svg>
          </button>
          <button type="button" (click)="exec('justifyCenter')" class="toolbar-btn" title="Align Center">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M7 12h10M4 18h16"/></svg>
          </button>
          <button type="button" (click)="exec('justifyRight')" class="toolbar-btn" title="Align Right">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M4 18h16"/></svg>
          </button>
          <button type="button" (click)="exec('justifyFull')" class="toolbar-btn" title="Justify">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>

        <div class="h-4 w-[1px] bg-stone-800 mx-0.5"></div>

        <!-- Bullet & Number Lists -->
        <div class="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
          <button 
            type="button" 
            (click)="exec('insertUnorderedList')" 
            class="toolbar-btn flex items-center gap-0.5" 
            title="Bulleted List"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
          </button>
          <button 
            type="button" 
            (click)="exec('insertOrderedList')" 
            class="toolbar-btn flex items-center gap-0.5" 
            title="Numbered List"
          >
            <span class="font-mono text-[10px] font-bold">1.</span>
          </button>
        </div>

        <div class="h-4 w-[1px] bg-stone-800 mx-0.5"></div>

        <!-- Inserts: Link, Image, Divider -->
        <div class="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 gap-0.5">
          <!-- Insert Link -->
          <button type="button" (click)="promptLink()" class="toolbar-btn" title="Insert Web Link">
            🔗
          </button>

          <!-- Insert Image from URL -->
          <button type="button" (click)="promptImageUrl()" class="toolbar-btn" title="Insert Image via Web URL">
            🌐 🖼️
          </button>

          <!-- Upload Image from PC -->
          <label class="toolbar-btn cursor-pointer" title="Upload Image from Computer">
            📁 🖼️
            <input 
              #fileInput 
              type="file" 
              accept="image/*" 
              (change)="handleImageUpload($event)" 
              class="hidden" 
            />
          </label>

          <!-- Horizontal Divider -->
          <button type="button" (click)="exec('insertHorizontalRule')" class="toolbar-btn font-mono" title="Horizontal Divider Line">
            ―
          </button>
        </div>

        <div class="h-4 w-[1px] bg-stone-800 mx-0.5"></div>

        <!-- Clear Format & Source View -->
        <button 
          type="button" 
          (click)="exec('removeFormat')" 
          class="toolbar-btn text-stone-400 hover:text-white" 
          title="Clear Formatting"
        >
          🧹
        </button>

        <button 
          type="button" 
          (click)="toggleSourceView()" 
          class="toolbar-btn px-2 text-[10px] font-mono"
          [ngClass]="isSourceView ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'"
          title="Toggle HTML Source"
        >
          &lt;/&gt; {{ isSourceView ? 'Rich' : 'HTML' }}
        </button>
      </div>

      <!-- Content Area -->
      <div class="relative">
        <!-- Visual Rich Editable Surface -->
        <div 
          #editorContent
          *ngIf="!isSourceView"
          contenteditable="true"
          (input)="onContentInput()"
          (blur)="onTouched()"
          [attr.data-placeholder]="placeholder"
          class="rich-editor-content p-4 min-h-[220px] max-h-[360px] overflow-y-auto text-stone-100 text-sm focus:outline-none font-serif leading-relaxed"
        ></div>

        <!-- Raw HTML Source Editor -->
        <textarea
          *ngIf="isSourceView"
          [(ngModel)]="sourceHtml"
          (ngModelChange)="onSourceChange($event)"
          rows="10"
          class="w-full p-4 bg-stone-950 font-mono text-xs text-amber-300 min-h-[220px] max-h-[360px] focus:outline-none resize-y"
        ></textarea>
      </div>

      <!-- Editor Footer Status -->
      <div class="px-3 py-1.5 bg-stone-950/60 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between font-mono">
        <span>Word-Style Rich Text Editor &bull; Supports Images & Bullet Points</span>
        <span>{{ getWordCount() }} words</span>
      </div>

    </div>
  `,
  styles: [`
    .toolbar-btn {
      padding: 0.25rem 0.45rem;
      border-radius: 0.375rem;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .toolbar-btn:hover {
      background-color: rgba(255, 255, 255, 0.12);
      color: #f59e0b;
    }
    .rich-editor-content:empty:before {
      content: attr(data-placeholder);
      color: #78716c;
      font-style: italic;
      pointer-events: none;
    }
    .rich-editor-content ul {
      list-style-type: disc !important;
      padding-left: 1.5rem !important;
      margin: 0.5rem 0 !important;
    }
    .rich-editor-content ol {
      list-style-type: decimal !important;
      padding-left: 1.5rem !important;
      margin: 0.5rem 0 !important;
    }
    .rich-editor-content blockquote {
      border-left: 3px solid #d97706;
      padding-left: 0.75rem;
      margin: 0.5rem 0;
      color: #d6d3d1;
      font-style: italic;
    }
    .rich-editor-content pre {
      background: #0c0a09;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-family: monospace;
      color: #fef08a;
      overflow-x: auto;
      margin: 0.5rem 0;
    }
    .rich-editor-content h2 {
      font-size: 1.25rem;
      font-weight: bold;
      color: #fef3c7;
      margin: 0.75rem 0 0.25rem;
    }
    .rich-editor-content h3 {
      font-size: 1.1rem;
      font-weight: bold;
      color: #fde68a;
      margin: 0.5rem 0 0.25rem;
    }
    .rich-editor-content img {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      margin: 0.5rem 0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class RichTextEditorComponent implements ControlValueAccessor, OnChanges, AfterViewInit {
  @ViewChild('editorContent') editorRef!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Type or format your detailed explanation here...';

  content = '';
  isSourceView = false;
  sourceHtml = '';

  onChange: (val: string) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    if (this.editorRef && this.content) {
      this.editorRef.nativeElement.innerHTML = this.content;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['content'] && this.editorRef) {
      if (this.editorRef.nativeElement.innerHTML !== this.content) {
        this.editorRef.nativeElement.innerHTML = this.content || '';
      }
    }
  }

  writeValue(value: string): void {
    this.content = value || '';
    this.sourceHtml = this.content;
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = this.content;
    }
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  exec(command: string, value: string | undefined = undefined): void {
    this.focusEditor();
    document.execCommand(command, false, value);
    this.onContentInput();
  }

  formatBlock(event: Event): void {
    const tag = (event.target as HTMLSelectElement).value;
    this.focusEditor();
    document.execCommand('formatBlock', false, tag);
    this.onContentInput();
  }

  changeTextColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.exec('foreColor', color);
  }

  changeHighlightColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.exec('hiliteColor', color);
  }

  promptLink(): void {
    const url = prompt('Enter the destination web URL:', 'https://');
    if (url) {
      this.exec('createLink', url);
    }
  }

  promptImageUrl(): void {
    const url = prompt('Enter the public image URL:', 'https://');
    if (url) {
      this.exec('insertImage', url);
    }
  }

  handleImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        if (base64Data) {
          this.exec('insertImage', base64Data);
        }
      };
      reader.readAsDataURL(file);
      input.value = ''; // Reset input
    }
  }

  onContentInput(): void {
    if (this.editorRef) {
      this.content = this.editorRef.nativeElement.innerHTML;
      this.sourceHtml = this.content;
      this.onChange(this.content);
    }
  }

  toggleSourceView(): void {
    if (this.isSourceView) {
      // Switching from Source to Rich
      this.content = this.sourceHtml;
      this.isSourceView = false;
      setTimeout(() => {
        if (this.editorRef) {
          this.editorRef.nativeElement.innerHTML = this.content;
        }
      });
    } else {
      // Switching from Rich to Source
      this.sourceHtml = this.content;
      this.isSourceView = true;
    }
    this.onChange(this.content);
  }

  onSourceChange(html: string): void {
    this.content = html;
    this.onChange(this.content);
  }

  private focusEditor(): void {
    if (this.editorRef) {
      this.editorRef.nativeElement.focus();
    }
  }

  getWordCount(): number {
    const text = this.content.replace(/<[^>]*>/g, ' ').trim();
    if (!text) return 0;
    return text.split(/\s+/).filter(Boolean).length;
  }
}

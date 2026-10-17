import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableOfContentsComponent } from './components/table-of-contents/table-of-contents.component';
import { BookViewComponent } from './components/book-view/book-view.component';
import { QaModalComponent } from './components/qa-modal/qa-modal.component';
import { DeleteConfirmDialogComponent } from './components/delete-confirm-dialog/delete-confirm-dialog.component';
import { ChapterModalComponent } from './components/chapter-modal/chapter-modal.component';
import { DeleteChapterDialogComponent } from './components/delete-chapter-dialog/delete-chapter-dialog.component';
import { LoginViewComponent } from './components/login-view/login-view.component';
import { BookStateService } from './services/book-state.service';
import { AuthService } from './services/auth.service';
import { ThemeService, BookTheme } from './services/theme.service';
import { FontService, AppFont } from './services/font.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableOfContentsComponent,
    BookViewComponent,
    QaModalComponent,
    DeleteConfirmDialogComponent,
    ChapterModalComponent,
    DeleteChapterDialogComponent,
    LoginViewComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  state = inject(BookStateService);
  auth = inject(AuthService);
  theme = inject(ThemeService);
  fontService = inject(FontService);

  changeTheme(t: BookTheme): void {
    this.theme.setTheme(t);
  }

  changeFont(f: AppFont): void {
    this.fontService.setFont(f);
  }
}

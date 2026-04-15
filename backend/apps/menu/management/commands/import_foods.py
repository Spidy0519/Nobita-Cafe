"""
Django management command to bulk import menu items from JSON file.

Usage:
    python manage.py import_foods foods.json
"""
import json
import sys
from decimal import Decimal
from django.core.management.base import BaseCommand, CommandError
from apps.menu.models import MenuItem, Category


class Command(BaseCommand):
    help = 'Bulk import food items from JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            'file',
            type=str,
            help='Path to JSON file containing food items (relative to project root)',
        )
        parser.add_argument(
            '--skip-duplicates',
            action='store_true',
            help='Skip items with duplicate names instead of updating',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing items before import',
        )

    def handle(self, *args, **options):
        file_path = options['file']

        # Load JSON file
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                items = json.load(f)
        except FileNotFoundError:
            raise CommandError(f'File not found: {file_path}')
        except json.JSONDecodeError as e:
            raise CommandError(f'Invalid JSON: {e}')

        if not isinstance(items, list):
            raise CommandError('JSON must be an array of items')

        self.stdout.write(self.style.WARNING(f'Found {len(items)} items to import'))

        # Clear existing items if requested
        if options['clear']:
            count = MenuItem.objects.count()
            MenuItem.objects.all().delete()
            self.stdout.write(self.style.WARNING(f'Deleted {count} existing items'))

        # Process each item
        created = 0
        updated = 0
        skipped = 0
        errors = []

        for idx, item_data in enumerate(items, 1):
            try:
                # Validate required fields
                if not item_data.get('name'):
                    errors.append(f'Row {idx}: Missing "name" field')
                    skipped += 1
                    continue

                if not item_data.get('category'):
                    errors.append(f'Row {idx}: Missing "category" field')
                    skipped += 1
                    continue

                if not item_data.get('price'):
                    errors.append(f'Row {idx}: Missing "price" field')
                    skipped += 1
                    continue

                # Get or create category
                category_name = item_data['category'].strip()
                category, cat_created = Category.objects.get_or_create(
                    name=category_name,
                    defaults={'icon': '🍽️', 'is_active': True}
                )

                # Prepare item data
                item_name = item_data['name'].strip()

                # Check if item already exists
                existing = MenuItem.objects.filter(
                    name__iexact=item_name,
                    category=category
                ).first()

                if existing:
                    if options['skip_duplicates']:
                        skipped += 1
                        continue
                    else:
                        # Update existing item
                        existing.price = Decimal(str(item_data['price']))
                        existing.image = item_data.get('image', '')
                        existing.description = item_data.get('description', '')
                        existing.is_available = item_data.get('available', True)
                        existing.save()
                        updated += 1
                        continue

                # Create new item
                MenuItem.objects.create(
                    name=item_name,
                    category=category,
                    price=Decimal(str(item_data['price'])),
                    image=item_data.get('image', ''),
                    description=item_data.get('description', ''),
                    is_available=item_data.get('available', True),
                    badge=item_data.get('badge', ''),
                    sort_order=item_data.get('sort_order', 0),
                )
                created += 1

                # Progress indicator
                if idx % 10 == 0:
                    self.stdout.write(f'Processed {idx}/{len(items)}...')

            except Decimal.InvalidOperation as e:
                errors.append(f'Row {idx}: Invalid price - {e}')
                skipped += 1
            except Exception as e:
                errors.append(f'Row {idx}: {str(e)}')
                skipped += 1

        # Summary
        self.stdout.write(self.style.SUCCESS(f'\n[OK] Import Complete!'))
        self.stdout.write(self.style.SUCCESS(f'  Created: {created}'))
        self.stdout.write(self.style.SUCCESS(f'  Updated: {updated}'))
        if skipped:
            self.stdout.write(self.style.WARNING(f'  Skipped: {skipped}'))

        if errors:
            self.stdout.write(self.style.ERROR('\nErrors:'))
            for error in errors[:20]:  # Show first 20 errors
                self.stdout.write(self.style.ERROR(f'  {error}'))
            if len(errors) > 20:
                self.stdout.write(self.style.ERROR(f'  ... and {len(errors) - 20} more'))

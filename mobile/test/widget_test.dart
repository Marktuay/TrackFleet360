import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('TrackFleetApp smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const TrackFleetApp());
    expect(find.byType(TrackFleetApp), findsOneWidget);
  });
}

import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/data/premium_catalog.dart';

const _purple = Color(0xFF8B5CF6);
const _cyan = Color(0xFF22D3EE);
const _ink = Color(0xFF070B14);
const _panel = Color(0xFF101827);
const _muted = Color(0xFFA8B4C8);

Color _surface(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark ? _panel : Colors.white;

Color _subcopy(BuildContext context) =>
    Theme.of(context).brightness == Brightness.dark ? _muted : const Color(0xFF52617A);

BoxDecoration _card(BuildContext context, {Gradient? gradient}) => BoxDecoration(
      color: gradient == null ? _surface(context).withOpacity(0.76) : null,
      gradient: gradient,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(
        color: Theme.of(context).brightness == Brightness.dark
            ? Colors.white.withOpacity(0.09)
            : const Color(0xFFE4E8F0),
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(
            Theme.of(context).brightness == Brightness.dark ? 0.16 : 0.05,
          ),
          blurRadius: 24,
          offset: const Offset(0, 12),
        ),
      ],
    );

int _columns(double width, {int max = 3}) {
  if (width >= 1180) return max;
  if (width >= 760) return max > 2 ? 2 : max;
  return 1;
}

class PremiumHomePage extends StatelessWidget {
  const PremiumHomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _HeroPanel(width: width),
          const SizedBox(height: 24),
          _ResponsiveGrid(
            columns: _columns(width, max: 4),
            children: const [
              _MetricTile(value: '12+', label: 'Active clubs', icon: Icons.hub_outlined),
              _MetricTile(value: '700+', label: 'Student members', icon: Icons.people_outline),
              _MetricTile(value: '30+', label: 'Experiences hosted', icon: Icons.rocket_launch_outlined),
              _MetricTile(value: '8', label: 'Awards earned', icon: Icons.emoji_events_outlined),
            ],
          ),
          const SizedBox(height: 42),
          const _SectionHeader(title: 'Featured events', subtitle: 'The next ideas worth showing up for'),
          const SizedBox(height: 16),
          _ResponsiveGrid(
            columns: _columns(width),
            children: [
              for (final event in PremiumCatalog.upcomingEvents.take(3))
                _EventCard(event: event, onTap: () => _openEvent(context, event)),
            ],
          ),
          const SizedBox(height: 42),
          const _SectionHeader(title: 'Explore the network', subtitle: 'Find your people, your problem space, and your next build'),
          const SizedBox(height: 16),
          _ResponsiveGrid(
            columns: _columns(width),
            children: [
              for (final club in PremiumCatalog.clubs)
                _ClubCard(club: club, onTap: () => _openClub(context, club)),
            ],
          ),
          const SizedBox(height: 42),
          const _CalloutPanel(),
        ],
      ),
    );
  }
}

class PremiumAboutPage extends StatelessWidget {
  const PremiumAboutPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(title: 'About CESA', subtitle: 'A student-led network for people who build with intent'),
          SizedBox(height: 20),
          _ResponsiveContentCards(cards: [
            _InfoBlock(title: 'History', icon: Icons.history_edu_outlined, text: 'CESA brings together developers, researchers, designers, and leaders to turn classroom curiosity into useful technology.'),
            _InfoBlock(title: 'Objectives', icon: Icons.track_changes_outlined, text: 'Create practical pathways for technical confidence, collaboration, professional growth, and meaningful campus participation.'),
            _InfoBlock(title: 'Vision', icon: Icons.visibility_outlined, text: 'Become the most trusted student technology network on campus for innovation, leadership, and shared progress.'),
            _InfoBlock(title: 'Mission', icon: Icons.flag_outlined, text: 'Empower students through workshops, mentorship, events, research, and community-led engineering experiences.'),
          ]),
          SizedBox(height: 36),
          _TimelinePanel(),
        ],
      ),
    );
  }
}

class PremiumVisionMissionPage extends StatelessWidget {
  const PremiumVisionMissionPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(title: 'Vision & mission', subtitle: 'The principles behind every initiative'),
          SizedBox(height: 20),
          _ResponsiveContentCards(cards: [
            _InfoBlock(title: 'Vision', icon: Icons.auto_awesome_outlined, text: 'A thriving campus ecosystem where research, collaboration, enterprise thinking, and technical leadership grow together.'),
            _InfoBlock(title: 'Mission', icon: Icons.explore_outlined, text: 'Host inclusive experiences, mentor students, and bridge classroom learning into real-world problem solving.'),
            _InfoBlock(title: 'Why join', icon: Icons.group_add_outlined, text: 'Find a place to practice, contribute, lead, and meet people who are curious enough to make the first move.'),
          ]),
        ],
      ),
    );
  }
}

class PremiumTeamPage extends StatelessWidget {
  const PremiumTeamPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionHeader(title: 'The people behind the platform', subtitle: 'Mentors and student leaders moving the community forward'),
          const SizedBox(height: 20),
          _ResponsiveGrid(
            columns: _columns(width),
            children: [
              for (final member in PremiumCatalog.teamMembers) _TeamCard(member: member),
            ],
          ),
        ],
      ),
    );
  }
}

class PremiumClubsPage extends StatelessWidget {
  const PremiumClubsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionHeader(title: 'Clubs', subtitle: 'Distinct communities, one connected technical culture'),
          const SizedBox(height: 20),
          _ResponsiveGrid(
            columns: _columns(width),
            children: [
              for (final club in PremiumCatalog.clubs)
                _ClubCard(club: club, onTap: () => _openClub(context, club)),
            ],
          ),
        ],
      ),
    );
  }
}

class PremiumIrisClubPage extends StatelessWidget {
  const PremiumIrisClubPage({super.key});

  @override
  Widget build(BuildContext context) {
    final iris = PremiumCatalog.clubs.firstWhere((club) => club.id == 'iris');
    final width = MediaQuery.sizeOf(context).width;

    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionHeader(
            title: iris.name,
            subtitle: 'Research-led AI, ML, and emerging systems community',
          ),
          const SizedBox(height: 20),
          _GlassSurface(
            decoration: _card(
              context,
              gradient: const LinearGradient(
                colors: [Color(0xFF17224A), Color(0xFF102D3A)],
              ),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final compact = constraints.maxWidth < 680;
                final intro = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const _Eyebrow(text: 'IRIS / INTELLIGENCE, RESEARCH, IMPACT'),
                    const SizedBox(height: 14),
                    Text(
                      'Turn curiosity into useful intelligence.',
                      style: Theme.of(context).textTheme.displaySmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      iris.description,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: const Color(0xFFC7D3EA),
                            height: 1.6,
                          ),
                    ),
                  ],
                );
                final facts = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _Meta(icon: Icons.school_outlined, text: iris.facultyCoordinator),
                    const SizedBox(height: 12),
                    _Meta(icon: Icons.groups_outlined, text: '${iris.studentCoordinators.length} student coordinators'),
                    const SizedBox(height: 12),
                    _Meta(icon: Icons.event_available_outlined, text: '${iris.upcomingEvents.length} upcoming sessions'),
                  ],
                );
                return compact
                    ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: [intro, const SizedBox(height: 24), facts])
                    : Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: intro), const SizedBox(width: 32), facts]);
              },
            ),
          ),
          const SizedBox(height: 28),
          const _SectionHeader(
            title: 'IRIS focus areas',
            subtitle: 'A practical path from research question to working prototype',
          ),
          const SizedBox(height: 16),
          _ResponsiveGrid(
            columns: _columns(width, max: 3),
            children: [
              for (final objective in iris.objectives)
                _InfoBlock(
                  title: objective.split('.').first,
                  text: objective,
                  icon: Icons.auto_awesome_outlined,
                ),
            ],
          ),
          const SizedBox(height: 28),
          const _SectionHeader(
            title: 'Next with IRIS',
            subtitle: 'Join the sessions shaping the next generation of builders',
          ),
          const SizedBox(height: 16),
          _ResponsiveGrid(
            columns: _columns(width, max: 2),
            children: [
              for (final name in iris.upcomingEvents)
                _InfoBlock(title: name, text: 'A hands-on IRIS Club experience for curious builders.', icon: Icons.event_outlined),
            ],
          ),
        ],
      ),
    );
  }
}

class PremiumUpcomingEventsPage extends StatelessWidget {
  const PremiumUpcomingEventsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _EventListingPage(
      title: 'Upcoming events',
      subtitle: 'Workshops, sprints, and conversations for the next build cycle',
      events: PremiumCatalog.upcomingEvents,
      showEditor: true,
      columns: _columns(width),
    );
  }
}

class PremiumPastEventsPage extends StatelessWidget {
  const PremiumPastEventsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _EventListingPage(
      title: 'Past events',
      subtitle: 'A record of the experiments, competitions, and community moments we shipped',
      events: PremiumCatalog.pastEvents,
      columns: _columns(width),
    );
  }
}

class PremiumGalleryPage extends StatelessWidget {
  const PremiumGalleryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionHeader(title: 'Gallery', subtitle: 'A visual archive of learning in public'),
          const SizedBox(height: 20),
          _ResponsiveGrid(
            columns: _columns(width),
            children: [
              for (final item in PremiumCatalog.galleryItems)
                _GalleryCard(item: item, tall: item.category == 'Events'),
            ],
          ),
        ],
      ),
    );
  }
}

class PremiumAchievementsPage extends StatelessWidget {
  const PremiumAchievementsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionHeader(title: 'Achievements', subtitle: 'Milestones that reflect student excellence'),
          const SizedBox(height: 20),
          _ResponsiveGrid(
            columns: _columns(width, max: 4),
            children: const [
              _MetricTile(value: '24', label: 'Competition wins', icon: Icons.military_tech_outlined),
              _MetricTile(value: '12', label: 'Hackathons hosted', icon: Icons.code_rounded),
              _MetricTile(value: '48', label: 'Awards and certificates', icon: Icons.workspace_premium_outlined),
              _MetricTile(value: '81', label: 'Student projects', icon: Icons.auto_graph_rounded),
            ],
          ),
          const SizedBox(height: 24),
          const _TimelinePanel(),
        ],
      ),
    );
  }
}

class PremiumSponsorsPage extends StatelessWidget {
  const PremiumSponsorsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionHeader(title: 'Sponsors & partners', subtitle: 'People and platforms that help students go further'),
          const SizedBox(height: 20),
          _ResponsiveGrid(
            columns: _columns(width),
            children: [
              for (final sponsor in PremiumCatalog.sponsors) _SponsorCard(sponsor: sponsor),
            ],
          ),
        ],
      ),
    );
  }
}

class PremiumContactPage extends StatelessWidget {
  const PremiumContactPage({super.key});

  @override
  Widget build(BuildContext context) {
    final inputDecoration = const InputDecoration(
      filled: true,
      hintStyle: TextStyle(color: _muted),
    );
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _SectionHeader(title: 'Let’s build something useful', subtitle: 'Questions, partnerships, or a project idea — send a note'),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, constraints) {
              final stacked = constraints.maxWidth < 760;
              final form = _ContactForm(decoration: inputDecoration);
              final details = const _ContactDetails();
              return stacked
                  ? Column(children: [form, const SizedBox(height: 16), details])
                  : Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Expanded(child: form),
                      const SizedBox(width: 16),
                      const Expanded(child: details),
                    ]);
            },
          ),
        ],
      ),
    );
  }
}

class _PageScaffold extends StatelessWidget {
  final Widget child;

  const _PageScaffold({required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).brightness == Brightness.dark ? _ink : const Color(0xFFF5F7FB),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(28, 28, 28, 48),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1280),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  child,
                  const SizedBox(height: 42),
                  const _SiteFooter(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _HeroPanel extends StatelessWidget {
  final double width;

  const _HeroPanel({required this.width});

  @override
  Widget build(BuildContext context) {
    final compact = width < 760;
    return Container(
      padding: EdgeInsets.all(compact ? 24 : 42),
      decoration: _card(
        context,
        gradient: const LinearGradient(
          colors: [Color(0xFF111B32), Color(0xFF201342), Color(0xFF082A3B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            right: compact ? -80 : 20,
            top: -100,
            child: _Glow(size: compact ? 180 : 280, color: _purple),
          ),
          Positioned(
            right: compact ? 30 : 180,
            bottom: -140,
            child: _Glow(size: 240, color: _cyan),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const _Eyebrow(text: 'CESA / TECHNICAL CLUB NETWORK'),
              const SizedBox(height: 20),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 760),
                child: Text(
                  'Build ideas that matter.',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        height: 1.02,
                      ),
                ),
              ),
              const SizedBox(height: 16),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 650),
                child: Text(
                  'A student-driven network for technical excellence, product thinking, leadership, and collaborative innovation across campus.',
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: const Color(0xFFC7D3EA), height: 1.6),
                ),
              ),
              const SizedBox(height: 26),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.arrow_forward_rounded),
                    label: const Text('Explore the network'),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.calendar_month_outlined),
                    label: const Text('View events'),
                    style: OutlinedButton.styleFrom(foregroundColor: Colors.white),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EventListingPage extends StatefulWidget {
  final String title;
  final String subtitle;
  final List<PremiumEventRecord> events;
  final bool showEditor;
  final int columns;

  const _EventListingPage({
    required this.title,
    required this.subtitle,
    required this.events,
    required this.columns,
    this.showEditor = false,
  });

  @override
  State<_EventListingPage> createState() => _EventListingPageState();
}

class _EventListingPageState extends State<_EventListingPage> {
  late List<PremiumEventRecord> _events;

  @override
  void initState() {
    super.initState();
    _events = List<PremiumEventRecord>.of(widget.events);
  }

  Future<void> _openEditor({PremiumEventRecord? event}) async {
    final result = await showDialog<PremiumEventRecord>(
      context: context,
      builder: (_) => PremiumEventEditorDialog(
        event: event,
        onDeleted: event == null
            ? null
            : () {
                setState(() => _events.removeWhere((item) => item.id == event.id));
              },
      ),
    );
    if (!mounted || result == null) return;
    setState(() {
      final index = _events.indexWhere((item) => item.id == result.id);
      if (index == -1) {
        _events = [result, ..._events];
      } else {
        _events[index] = result;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return _PageScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _SectionHeader(title: widget.title, subtitle: widget.subtitle)),
              if (widget.showEditor)
                IconButton.filledTonal(
                  tooltip: 'Open frontend event editor',
                  onPressed: () => _openEditor(),
                  icon: const Icon(Icons.add_rounded),
                ),
            ],
          ),
          const SizedBox(height: 20),
          _ResponsiveGrid(
            columns: widget.columns,
            children: [
              for (final event in _events)
                Stack(
                  children: [
                    _EventCard(event: event, onTap: () => _openEvent(context, event)),
                    if (widget.showEditor)
                      Positioned(
                        top: 12,
                        right: 12,
                        child: IconButton.filledTonal(
                          tooltip: 'Edit ${event.name}',
                          onPressed: () => _openEditor(event: event),
                          icon: const Icon(Icons.edit_outlined, size: 17),
                        ),
                      ),
                  ],
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class PremiumEventEditorDialog extends StatefulWidget {
  final PremiumEventRecord? event;
  final VoidCallback? onDeleted;

  const PremiumEventEditorDialog({super.key, this.event, this.onDeleted});

  @override
  State<PremiumEventEditorDialog> createState() => _PremiumEventEditorDialogState();
}

class _PremiumEventEditorDialogState extends State<PremiumEventEditorDialog> {
  String _status = 'Registration Open';
  late final TextEditingController _name;
  late final TextEditingController _date;
  late final TextEditingController _time;
  late final TextEditingController _venue;
  late final TextEditingController _description;
  late final TextEditingController _link;

  @override
  void initState() {
    super.initState();
    final event = widget.event;
    _name = TextEditingController(text: event?.name ?? '');
    _date = TextEditingController(text: event?.date ?? '');
    _time = TextEditingController(text: event?.time ?? '');
    _venue = TextEditingController(text: event?.venue ?? '');
    _description = TextEditingController(text: event?.description ?? '');
    _link = TextEditingController(text: event?.registrationLink ?? '');
    _status = event?.status ?? _status;
  }

  @override
  void dispose() {
    _name.dispose();
    _date.dispose();
    _time.dispose();
    _venue.dispose();
    _description.dispose();
    _link.dispose();
    super.dispose();
  }

  void _save() {
    final name = _name.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add an event name before saving.')),
      );
      return;
    }
    final original = widget.event;
    Navigator.pop(
      context,
      PremiumEventRecord(
        id: original?.id ?? 'local-${DateTime.now().microsecondsSinceEpoch}',
        clubId: original?.clubId ?? 'cesa',
        clubName: original?.clubName ?? 'CESA',
        name: name,
        bannerAsset: original?.bannerAsset ?? 'assets/images/Cesa/cesa_logo.png',
        date: _date.text.trim().isEmpty ? 'Date to be announced' : _date.text.trim(),
        time: _time.text.trim().isEmpty ? 'Time to be announced' : _time.text.trim(),
        venue: _venue.text.trim().isEmpty ? 'Venue to be announced' : _venue.text.trim(),
        description: _description.text.trim().isEmpty ? 'Details coming soon.' : _description.text.trim(),
        registrationLink: _link.text.trim(),
        category: original?.category ?? 'Workshops',
        status: _status,
        tags: original?.tags ?? const ['Community'],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.event == null ? 'Add upcoming event' : 'Edit upcoming event'),
      content: SingleChildScrollView(
        child: SizedBox(
          width: 520,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _EditorField(label: 'Event name', hint: 'AI Product Sprint', controller: _name),
              const _EditorField(label: 'Banner', hint: 'Choose an image', icon: Icons.upload_file_outlined),
              Row(children: [
                Expanded(child: _EditorField(label: 'Date', hint: '18 Oct 2026', icon: Icons.calendar_today_outlined, controller: _date)),
                SizedBox(width: 12),
                Expanded(child: _EditorField(label: 'Time', hint: '10:00 AM', icon: Icons.schedule_outlined, controller: _time)),
              ]),
              _EditorField(label: 'Venue', hint: 'Innovation Hall', icon: Icons.location_on_outlined, controller: _venue),
              _EditorField(label: 'Description', hint: 'Describe the event...', maxLines: 3, controller: _description),
              _EditorField(label: 'Registration link', hint: 'https://...', controller: _link),
              DropdownButtonFormField<String>(
                value: _status,
                decoration: const InputDecoration(labelText: 'Status'),
                items: const [
                  DropdownMenuItem(value: 'Registration Open', child: Text('Registration Open')),
                  DropdownMenuItem(value: 'Draft', child: Text('Draft')),
                  DropdownMenuItem(value: 'Completed', child: Text('Completed')),
                ],
                onChanged: (value) => setState(() => _status = value ?? _status),
              ),
            ],
          ),
        ),
      ),
      actions: [
        if (widget.event != null)
          TextButton(
            onPressed: () {
              widget.onDeleted?.call();
              Navigator.pop(context);
            },
            child: const Text('Delete'),
          ),
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(onPressed: _save, child: const Text('Save event')),
      ],
    );
  }
}

class _EditorField extends StatelessWidget {
  final String label;
  final String hint;
  final IconData? icon;
  final int maxLines;
  final TextEditingController? controller;

  const _EditorField({required this.label, required this.hint, this.icon, this.maxLines = 1, this.controller});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(labelText: label, hintText: hint, prefixIcon: icon == null ? null : Icon(icon)),
      ),
    );
  }
}

class _ResponsiveContentCards extends StatelessWidget {
  final List<Widget> cards;

  const _ResponsiveContentCards({required this.cards});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) => _ResponsiveGrid(
        columns: _columns(constraints.maxWidth, max: cards.length >= 4 ? 2 : 3),
        children: cards,
      ),
    );
  }
}

class _ResponsiveGrid extends StatelessWidget {
  final int columns;
  final List<Widget> children;

  const _ResponsiveGrid({required this.columns, required this.children});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: columns,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: columns == 1 ? 1.55 : 1.2,
      children: children,
    );
  }
}

class _GlassSurface extends StatelessWidget {
  final Widget child;
  final Decoration decoration;
  final BorderRadius borderRadius;

  const _GlassSurface({
    required this.child,
    required this.decoration,
    this.borderRadius = const BorderRadius.all(Radius.circular(24)),
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
        child: DecoratedBox(decoration: decoration, child: child),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionHeader({required this.title, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w800)),
        const SizedBox(height: 6),
        Text(subtitle, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: _subcopy(context))),
      ],
    );
  }
}

class _Eyebrow extends StatelessWidget {
  final String text;

  const _Eyebrow({required this.text});

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: _cyan,
              letterSpacing: 1.5,
              fontWeight: FontWeight.w800,
            ),
      );
}

class _Glow extends StatelessWidget {
  final double size;
  final Color color;

  const _Glow({required this.size, required this.color});

  @override
  Widget build(BuildContext context) => IgnorePointer(
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(colors: [color.withOpacity(0.42), color.withOpacity(0.0)]),
          ),
        ),
      );
}

class _MetricTile extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;

  const _MetricTile({required this.value, required this.label, required this.icon});

  @override
  Widget build(BuildContext context) => _GlassSurface(
        decoration: _card(context),
        child: Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: _cyan),
            const Spacer(),
            Text(value, style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: _purple, fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(label, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: _subcopy(context))),
          ],
        ),
        ),
      );
}

class _EventCard extends StatelessWidget {
  final PremiumEventRecord event;
  final VoidCallback onTap;

  const _EventCard({required this.event, required this.onTap});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: _GlassSurface(
          decoration: _card(context),
          child: Container(
            padding: const EdgeInsets.all(16),
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _AssetBanner(asset: event.bannerAsset, icon: Icons.event_available_outlined),
              const SizedBox(height: 14),
              Row(children: [
                _Badge(text: event.category, color: _purple),
                const Spacer(),
                _Badge(text: event.status, color: _cyan),
              ]),
              const SizedBox(height: 12),
              Text(event.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 6),
              Text(event.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: _subcopy(context))),
              const Spacer(),
              const SizedBox(height: 14),
              Wrap(spacing: 12, runSpacing: 6, children: [
                _Meta(icon: Icons.calendar_today_outlined, text: event.date),
                _Meta(icon: Icons.schedule_outlined, text: event.time),
                _Meta(icon: Icons.location_on_outlined, text: event.venue),
              ]),
            ],
            ),
          ),
        ),
      );
}

class _ClubCard extends StatelessWidget {
  final PremiumClubRecord club;
  final VoidCallback onTap;

  const _ClubCard({required this.club, required this.onTap});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: _GlassSurface(
          decoration: _card(context, gradient: LinearGradient(
            colors: Theme.of(context).brightness == Brightness.dark
                ? [const Color(0xFF111B2D), const Color(0xFF121525)]
                : [Colors.white, const Color(0xFFF4F6FF)],
          )),
          child: Container(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                _Logo(asset: club.logoAsset),
                const Spacer(),
                const Icon(Icons.arrow_outward_rounded, color: _cyan),
              ]),
              const SizedBox(height: 16),
              Text(club.name, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text(club.description, maxLines: 3, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: _subcopy(context))),
              const Spacer(),
              const SizedBox(height: 16),
              Text('Faculty: ${club.facultyCoordinator}', style: Theme.of(context).textTheme.labelMedium?.copyWith(color: _purple)),
            ],
          ),
          ),
        ),
      );
}

class _TeamCard extends StatelessWidget {
  final TeamMemberRecord member;

  const _TeamCard({required this.member});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(18),
        decoration: _card(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _AssetBanner(asset: member.imageAsset, icon: Icons.person_outline_rounded),
            const SizedBox(height: 16),
            Text(member.name, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(member.position, style: Theme.of(context).textTheme.labelLarge?.copyWith(color: _purple)),
            const SizedBox(height: 10),
            Text(member.tagline, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: _subcopy(context))),
            const Spacer(),
            Wrap(spacing: 8, children: [
              for (final social in member.socials.keys) _SocialButton(social: social, url: member.socials[social]!),
            ]),
          ],
        ),
      );
}

class _GalleryCard extends StatelessWidget {
  final GalleryItemRecord item;
  final bool tall;

  const _GalleryCard({required this.item, required this.tall});

  @override
  Widget build(BuildContext context) => Container(
        height: tall ? 280 : 220,
        decoration: _card(context),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(item.imageAsset, fit: BoxFit.cover),
            DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black.withOpacity(0.82)]))),
            Positioned(left: 16, right: 16, bottom: 16, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              _Badge(text: item.category, color: _cyan),
              const SizedBox(height: 8),
              Text(item.title, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
            ])),
          ],
        ),
      );
}

class _SponsorCard extends StatelessWidget {
  final SponsorRecord sponsor;

  const _SponsorCard({required this.sponsor});

  @override
  Widget build(BuildContext context) => InkWell(
        onTap: () => launchUrl(Uri.parse(sponsor.url), mode: LaunchMode.externalApplication),
        borderRadius: BorderRadius.circular(24),
        child: Container(
          padding: const EdgeInsets.all(22),
          decoration: _card(context),
          child: Row(children: [
            _Logo(asset: sponsor.logoAsset),
            const SizedBox(width: 16),
            Expanded(child: Text(sponsor.name, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800))),
            const Icon(Icons.open_in_new_rounded, color: _cyan),
          ]),
        ),
      );
}

class _InfoBlock extends StatelessWidget {
  final String title;
  final String text;
  final IconData icon;

  const _InfoBlock({required this.title, required this.text, required this.icon});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(22),
        decoration: _card(context),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: _cyan),
          const SizedBox(height: 18),
          Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          Text(text, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: _subcopy(context), height: 1.6)),
        ]),
      );
}

class _TimelinePanel extends StatelessWidget {
  const _TimelinePanel();

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(22),
        decoration: _card(context, gradient: const LinearGradient(colors: [Color(0xFF121D34), Color(0xFF15102C)])),
        child: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _Eyebrow(text: 'OUR ARC'),
          SizedBox(height: 18),
          _TimelineRow(year: '2023', text: 'Expanded membership and leadership programs across clubs.'),
          _TimelineRow(year: '2024', text: 'Community workshops, certificates, and research showcases.'),
          _TimelineRow(year: '2025', text: 'National-level hackathon participation and student-led wins.'),
        ]),
      );
}

class _TimelineRow extends StatelessWidget {
  final String year;
  final String text;

  const _TimelineRow({required this.year, required this.text});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 58, child: Text(year, style: Theme.of(context).textTheme.titleMedium?.copyWith(color: _cyan, fontWeight: FontWeight.w800))),
          Expanded(child: Text(text, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: const Color(0xFFC7D3EA)))),
        ]),
      );
}

class _CalloutPanel extends StatelessWidget {
  const _CalloutPanel();

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: _card(context, gradient: const LinearGradient(colors: [Color(0xFF2A1751), Color(0xFF102F3D)])),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 560;
            final message = const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Eyebrow(text: 'YOUR NEXT MOVE'),
                SizedBox(height: 8),
                Text('Bring a question. Leave with a project.', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
              ],
            );
            final action = FilledButton(onPressed: () {}, child: const Text('Join the community'));
            return compact
                ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: [message, const SizedBox(height: 18), action])
                : Row(children: [Expanded(child: message), action]);
          },
        ),
      );
}

class _SiteFooter extends StatelessWidget {
  const _SiteFooter();

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(20, 22, 20, 18),
        decoration: _card(context, gradient: const LinearGradient(colors: [Color(0xFF101A2E), Color(0xFF17132E)])),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Wrap(
              spacing: 16,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                const Text(
                  'CESA / Build together, ship with purpose.',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16),
                ),
                Text('© ${DateTime.now().year} CESA', style: const TextStyle(color: _muted)),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 18,
              runSpacing: 8,
              children: const [
                _FooterLink(label: 'About'),
                _FooterLink(label: 'Clubs'),
                _FooterLink(label: 'Events'),
                _FooterLink(label: 'Contact'),
              ],
            ),
            const SizedBox(height: 18),
            ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Get the next event in your inbox',
                  suffixIcon: IconButton(onPressed: () {}, icon: const Icon(Icons.arrow_forward_rounded, color: _cyan)),
                ),
              ),
            ),
          ],
        ),
      );
}

class _FooterLink extends StatelessWidget {
  final String label;

  const _FooterLink({required this.label});

  @override
  Widget build(BuildContext context) => Text(label, style: const TextStyle(color: _muted, fontWeight: FontWeight.w600));
}

class _ContactForm extends StatelessWidget {
  final InputDecoration decoration;

  const _ContactForm({required this.decoration});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: _card(context),
        child: Column(children: [
          TextField(decoration: decoration.copyWith(hintText: 'Your name')),
          const SizedBox(height: 12),
          TextField(decoration: decoration.copyWith(hintText: 'Email address')),
          const SizedBox(height: 12),
          TextField(maxLines: 5, decoration: decoration.copyWith(hintText: 'Project or partnership idea')),
          const SizedBox(height: 16),
          SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: () {}, icon: const Icon(Icons.send_rounded), label: const Text('Send message'))),
        ]),
      );
}

class _ContactDetails extends StatelessWidget {
  const _ContactDetails();

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: _card(context, gradient: const LinearGradient(colors: [Color(0xFF111C32), Color(0xFF17122B)])),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const _Eyebrow(text: 'CAMPUS CONNECT'),
          const SizedBox(height: 18),
          Text('PCCOE Department of Computer Engineering', style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
          const SizedBox(height: 20),
          const _Meta(icon: Icons.email_outlined, text: 'hello@pccoecesa.org'),
          const _Meta(icon: Icons.phone_outlined, text: '+91 98765 43210'),
          const _Meta(icon: Icons.location_on_outlined, text: 'PCCOE Campus, Pune'),
          const SizedBox(height: 20),
          Container(height: 150, decoration: BoxDecoration(color: Colors.white.withOpacity(0.06), borderRadius: BorderRadius.circular(18)), child: const Center(child: Icon(Icons.map_outlined, color: _cyan, size: 42))),
        ]),
      );
}

class _AssetBanner extends StatelessWidget {
  final String asset;
  final IconData icon;

  const _AssetBanner({required this.asset, required this.icon});

  @override
  Widget build(BuildContext context) => Container(
        height: 116,
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          gradient: const LinearGradient(colors: [Color(0xFF21164A), Color(0xFF0A3341)]),
        ),
        child: Image.asset(asset, fit: BoxFit.contain, errorBuilder: (_, __, ___) => Icon(icon, color: _cyan, size: 42)),
      );
}

class _Logo extends StatelessWidget {
  final String asset;

  const _Logo({required this.asset});

  @override
  Widget build(BuildContext context) => Container(
        width: 54,
        height: 54,
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.08), borderRadius: BorderRadius.circular(16)),
        child: Image.asset(asset, fit: BoxFit.contain, errorBuilder: (_, __, ___) => const Icon(Icons.code_rounded, color: _cyan)),
      );
}

class _Badge extends StatelessWidget {
  final String text;
  final Color color;

  const _Badge({required this.text, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
        decoration: BoxDecoration(color: color.withOpacity(0.14), borderRadius: BorderRadius.circular(99)),
        child: Text(text, style: Theme.of(context).textTheme.labelSmall?.copyWith(color: color, fontWeight: FontWeight.w800)),
      );
}

class _Meta extends StatelessWidget {
  final IconData icon;
  final String text;

  const _Meta({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 15, color: _cyan),
          const SizedBox(width: 6),
          Flexible(child: Text(text, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.labelMedium?.copyWith(color: _subcopy(context)))),
        ]),
      );
}

class _SocialButton extends StatelessWidget {
  final String social;
  final String url;

  const _SocialButton({required this.social, required this.url});

  @override
  Widget build(BuildContext context) => IconButton(
        visualDensity: VisualDensity.compact,
        tooltip: social,
        onPressed: () => launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication),
        icon: Icon(social == 'mail' ? Icons.mail_outline : Icons.link_rounded, size: 18, color: _cyan),
      );
}

void _openEvent(BuildContext context, PremiumEventRecord event) {
  Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => PremiumEventDetailsPage(event: event)));
}

void _openClub(BuildContext context, PremiumClubRecord club) {
  Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => PremiumClubDetailsPage(club: club)));
}

class PremiumEventDetailsPage extends StatelessWidget {
  final PremiumEventRecord event;

  const PremiumEventDetailsPage({super.key, required this.event});

  @override
  Widget build(BuildContext context) => _PageScaffold(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          _AssetBanner(asset: event.bannerAsset, icon: Icons.event_outlined),
          const SizedBox(height: 22),
          _Badge(text: event.category, color: _purple),
          const SizedBox(height: 10),
          Text(event.name, style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          Text(event.description, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: _subcopy(context), height: 1.6)),
          const SizedBox(height: 22),
          _ResponsiveContentCards(cards: [
            _InfoBlock(title: 'When', icon: Icons.calendar_month_outlined, text: '${event.date}\n${event.time}'),
            _InfoBlock(title: 'Where', icon: Icons.location_on_outlined, text: event.venue),
            _InfoBlock(title: 'Timeline', icon: Icons.timeline_outlined, text: 'Check-in · Opening · Build session · Showcase'),
          ]),
          const SizedBox(height: 22),
          FilledButton.icon(onPressed: () => launchUrl(Uri.parse(event.registrationLink), mode: LaunchMode.externalApplication), icon: const Icon(Icons.open_in_new_rounded), label: const Text('Register for this event')),
        ]),
      );
}

class PremiumClubDetailsPage extends StatelessWidget {
  final PremiumClubRecord club;

  const PremiumClubDetailsPage({super.key, required this.club});

  @override
  Widget build(BuildContext context) => _PageScaffold(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [_Logo(asset: club.logoAsset), const SizedBox(width: 16), Expanded(child: Text(club.name, style: Theme.of(context).textTheme.displaySmall?.copyWith(fontWeight: FontWeight.w800)))]),
          const SizedBox(height: 16),
          Text(club.description, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: _subcopy(context), height: 1.6)),
          const SizedBox(height: 22),
          _ResponsiveContentCards(cards: [
            _InfoBlock(title: 'Faculty coordinator', icon: Icons.school_outlined, text: club.facultyCoordinator),
            _InfoBlock(title: 'Student coordinators', icon: Icons.people_outline, text: club.studentCoordinators.join('\n')),
            _InfoBlock(title: 'Objectives', icon: Icons.track_changes_outlined, text: club.objectives.join('\n')),
          ]),
          const SizedBox(height: 22),
          Wrap(spacing: 10, children: [
            for (final entry in club.socialLinks.entries) _SocialButton(social: entry.key, url: entry.value),
          ]),
        ]),
      );
}

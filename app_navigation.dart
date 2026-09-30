import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'core/motion/cesa_motion_tokens.dart';
import 'core/data/dummy_data.dart';
import 'features/site/premium_sections.dart';

// ─── Token helpers ────────────────────────────────────────────────────────────

Color _navSurface(bool d) =>
    d ? const Color(0xFF111317) : const Color(0xFFFAF9F6);
Color _navBorder(bool d) =>
    d ? const Color(0xFF292D34) : const Color(0xFFD6D3CC);
Color _navSelected(bool d) =>
    d ? const Color(0xFF4D7CFE) : const Color(0xFF2448B8);
Color _navUnselected(bool d) =>
    d ? const Color(0xFF777B84) : const Color(0xFF7A7F87);
Color _navPill(bool d) => d ? const Color(0xFF1E2540) : const Color(0xFFE2E9FF);

// ─── AppNavigation ────────────────────────────────────────────────────────────

class AppNavigation extends StatefulWidget {
  const AppNavigation({super.key});

  @override
  State<AppNavigation> createState() => _AppNavigationState();
}

class _AppNavigationState extends State<AppNavigation> {
  int _selectedIndex = 0;

  void _onNavigationChanged(int index) {
    if (index == _selectedIndex) return;
    HapticFeedback.selectionClick();
    setState(() => _selectedIndex = index);
  }

  static const List<_AppSection> _sections = [
    _AppSection(
      label: 'Home',
      icon: Icons.home_rounded,
      builder: () => PremiumHomePage(),
    ),
    _AppSection(
      label: 'About',
      icon: Icons.info_outline_rounded,
      builder: () => PremiumAboutPage(),
    ),
    _AppSection(
      label: 'Vision & Mission',
      icon: Icons.visibility_outlined,
      builder: () => PremiumVisionMissionPage(),
    ),
    _AppSection(
      label: 'Team',
      icon: Icons.group_outlined,
      builder: () => PremiumTeamPage(),
    ),
    _AppSection(
      label: 'Clubs',
      icon: Icons.groups_rounded,
      builder: () => PremiumClubsPage(),
    ),
    _AppSection(
      label: 'IRIS Club',
      icon: Icons.auto_awesome_rounded,
      builder: () => PremiumIrisClubPage(),
    ),
    _AppSection(
      label: 'Upcoming Events',
      icon: Icons.event_available_rounded,
      builder: () => PremiumUpcomingEventsPage(),
    ),
    _AppSection(
      label: 'Past Events',
      icon: Icons.history_rounded,
      builder: () => PremiumPastEventsPage(),
    ),
    _AppSection(
      label: 'Gallery',
      icon: Icons.image_rounded,
      builder: () => PremiumGalleryPage(),
    ),
    _AppSection(
      label: 'Achievements',
      icon: Icons.emoji_events_rounded,
      builder: () => PremiumAchievementsPage(),
    ),
    _AppSection(
      label: 'Sponsors',
      icon: Icons.handshake_rounded,
      builder: () => PremiumSponsorsPage(),
    ),
    _AppSection(
      label: 'Contact',
      icon: Icons.mail_outline_rounded,
      builder: () => PremiumContactPage(),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final isDesktop = MediaQuery.of(context).size.width >= 980;
    final currentContent = _sections[_selectedIndex].builder();

    final sideBar = Container(
      width: 262,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0B1017) : const Color(0xFFF8F9FD),
        border: Border(
          right: BorderSide(
            color: isDark ? const Color(0xFF1E2533) : const Color(0xFFE1E7F4),
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 20, 18, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF7C5CFF), Color(0xFF45D3FF)],
                      ),
                    ),
                    child: const Icon(Icons.code_rounded, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CESA',
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: isDark ? Colors.white : const Color(0xFF111827),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        'Club Network',
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: isDark ? const Color(0xFFB5C0D5) : const Color(0xFF596A8A),
                          letterSpacing: 1.1,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Expanded(
                child: ListView.separated(
                  itemCount: _sections.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final section = _sections[index];
                    final active = index == _selectedIndex;
                    return _SidebarNavButton(
                      label: section.label,
                      icon: section.icon,
                      active: active,
                      isDark: isDark,
                      onTap: () => _onNavigationChanged(index),
                    );
                  },
                ),
              ),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF101A2A) : const Color(0xFFEAF1FF),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: isDark ? const Color(0xFF24314B) : const Color(0xFFD8E5FF),
                    width: 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Live',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: const Color(0xFF45D3FF),
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Club operations and upcoming sessions are active.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: isDark ? const Color(0xFFC1CDE7) : const Color(0xFF435775),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );

    if (isDesktop) {
      return Scaffold(
        backgroundColor: theme.scaffoldBackgroundColor,
        body: Row(
          children: [
            sideBar,
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 220),
                child: KeyedSubtree(
                  key: ValueKey<int>(_selectedIndex),
                  child: currentContent,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        foregroundColor: isDark ? Colors.white : const Color(0xFF0F172A),
        elevation: 0,
        title: Text(
          _sections[_selectedIndex].label,
          style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        ),
      ),
      drawer: Drawer(
        backgroundColor: isDark ? const Color(0xFF0B1017) : const Color(0xFFF8F9FD),
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              const SizedBox(height: 10),
              ..._sections.asMap().entries.map((entry) {
                final index = entry.key;
                final section = entry.value;
                final active = index == _selectedIndex;
                return ListTile(
                  leading: Icon(
                    section.icon,
                    color: active ? const Color(0xFF7C5CFF) : (isDark ? Colors.white70 : const Color(0xFF475569)),
                  ),
                  title: Text(
                    section.label,
                    style: theme.textTheme.titleSmall?.copyWith(
                      color: active ? const Color(0xFF7C5CFF) : (isDark ? Colors.white : const Color(0xFF111827)),
                      fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                  selected: active,
                  selectedTileColor: isDark ? const Color(0xFF111827) : const Color(0xFFEAF1FF),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  onTap: () {
                    _onNavigationChanged(index);
                    Navigator.of(context).pop();
                  },
                );
              }),
            ],
          ),
        ),
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        child: KeyedSubtree(
          key: ValueKey<int>(_selectedIndex),
          child: currentContent,
        ),
      ),
    );
  }
}

class _SidebarNavButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool active;
  final bool isDark;
  final VoidCallback onTap;

  const _SidebarNavButton({
    required this.label,
    required this.icon,
    required this.active,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: active
          ? (isDark ? const Color(0xFF111827) : const Color(0xFFEAF1FF))
          : Colors.transparent,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Row(
            children: [
              Icon(
                icon,
                size: 18,
                color: active ? const Color(0xFF7C5CFF) : (isDark ? Colors.white70 : const Color(0xFF475569)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: active ? const Color(0xFF7C5CFF) : (isDark ? Colors.white : const Color(0xFF111827)),
                    fontWeight: active ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AppSection {
  final String label;
  final IconData icon;
  final Widget Function() builder;

  const _AppSection({
    required this.label,
    required this.icon,
    required this.builder,
  });
}

// ─── Tab Content Transition ──────────────────────────────────────────────────

class _TabContentTransition extends StatefulWidget {
  final Widget child;
  final bool isActive;

  const _TabContentTransition({
    required this.child,
    required this.isActive,
  });

  @override
  State<_TabContentTransition> createState() => _TabContentTransitionState();
}

class _TabContentTransitionState extends State<_TabContentTransition>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: CesaMotionTokens.component,
    );
    _fadeAnimation = Tween<double>(begin: 0.88, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: CesaMotionTokens.enter),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0.0, 0.008),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: CesaMotionTokens.enter),
    );

    if (widget.isActive) {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant _TabContentTransition oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive) {
      if (mounted) {
        final disableMotion = MediaQuery.disableAnimationsOf(context);
        if (disableMotion) {
          _controller.value = 1.0;
        } else {
          _controller.forward(from: 0.0);
        }
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final disableMotion = MediaQuery.disableAnimationsOf(context);
    if (disableMotion) {
      return widget.child;
    }
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}

// ─── Nav Bar ──────────────────────────────────────────────────────────────────

class _CesaNavBar extends StatelessWidget {
  final int selectedIndex;
  final bool isDark;
  final ThemeData theme;
  final ValueChanged<int> onTap;

  const _CesaNavBar({
    required this.selectedIndex,
    required this.isDark,
    required this.theme,
    required this.onTap,
  });

  static const _items = <_NavItem>[
    _NavItem(
      label: 'Home',
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
    ),
    _NavItem(
      label: 'Clubs',
      icon: Icons.groups_outlined,
      activeIcon: Icons.groups_rounded,
    ),
    _NavItem(
      label: 'Alerts',
      icon: Icons.notifications_outlined,
      activeIcon: Icons.notifications_rounded,
    ),
    _NavItem(
      label: 'Leaderboard',
      icon: Icons.emoji_events_outlined,
      activeIcon: Icons.emoji_events_rounded,
    ),
    _NavItem(
      label: 'Profile',
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final disableMotion = MediaQuery.disableAnimationsOf(context);
    final duration = disableMotion ? Duration.zero : CesaMotionTokens.component;

    return Container(
      decoration: BoxDecoration(
        color: _navSurface(isDark),
        border: Border(top: BorderSide(color: _navBorder(isDark), width: 1.0)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 60,
          child: LayoutBuilder(
            builder: (context, constraints) {
              final totalWidth = constraints.maxWidth;
              final itemWidth = totalWidth / _items.length;
              final pillWidth = (itemWidth * 0.84).clamp(52.0, 84.0);
              final pillLeft = selectedIndex * itemWidth + (itemWidth - pillWidth) / 2;

              return Stack(
                children: [
                  // Sliding background indicator pill ("THE BAR SLIDES")
                  AnimatedPositioned(
                    duration: duration,
                    curve: CesaMotionTokens.enter,
                    left: pillLeft,
                    top: 6,
                    width: pillWidth,
                    height: 48,
                    child: Container(
                      decoration: BoxDecoration(
                        color: _navPill(isDark),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _navSelected(isDark).withValues(alpha: isDark ? 0.25 : 0.15),
                          width: 1.0,
                        ),
                      ),
                    ),
                  ),

                  // Interactive navigation tiles
                  Row(
                    children: List.generate(_items.length, (i) {
                      final item = _items[i];
                      final selected = i == selectedIndex;

                      return Expanded(
                        child: _NavTile(
                          item: item,
                          selected: selected,
                          isDark: isDark,
                          theme: theme,
                          onTap: () => onTap(i),
                        ),
                      );
                    }),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

class _NavTile extends StatelessWidget {
  final _NavItem item;
  final bool selected;
  final bool isDark;
  final ThemeData theme;
  final VoidCallback onTap;

  const _NavTile({
    required this.item,
    required this.selected,
    required this.isDark,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final disableMotion = MediaQuery.disableAnimationsOf(context);
    final duration = disableMotion ? Duration.zero : CesaMotionTokens.component;
    final iconColor = selected ? _navSelected(isDark) : _navUnselected(isDark);
    final labelColor = selected ? _navSelected(isDark) : _navUnselected(isDark);

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Center(
        child: AnimatedSize(
          duration: duration,
          curve: CesaMotionTokens.enter,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                ValueListenableBuilder<int>(
                  valueListenable: notificationUnreadCountNotifier,
                  builder: (context, unreadCount, child) {
                    final hasUnreadAlerts =
                        item.label == 'Alerts' && unreadCount > 0;
                    return Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Icon(
                          selected ? item.activeIcon : item.icon,
                          size: 20,
                          color: iconColor,
                        ),
                        if (hasUnreadAlerts)
                          Positioned(
                            top: -1,
                            right: -3,
                            child: Container(
                              width: 6,
                              height: 6,
                              decoration: BoxDecoration(
                                color: _navSelected(isDark),
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 3),
                AnimatedDefaultTextStyle(
                  duration: duration,
                  curve: CesaMotionTokens.enter,
                  style: (theme.textTheme.labelSmall ?? const TextStyle()).copyWith(
                    color: labelColor,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 10.5,
                    letterSpacing: 0.1,
                  ),
                  child: Text(
                    item.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;

  const _NavItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
  });
}
